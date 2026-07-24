extends Node2D

const PLAYER_SCENE_PATH    := "res://scenes/player/Player.tscn"
const HUD_SCENE_PATH       := "res://scenes/ui/HUD.tscn"
const SLOT_GRID_SCENE_PATH := "res://scenes/tiles/SlotGrid.tscn"
const REMOTE_PLAYER_SCRIPT := "res://scripts/player/remote_player.gd"

var tile_id:   String     = ""
var tile_data: Dictionary = {}

@onready var player_spawn: Marker2D = $PlayerSpawn
@onready var back_button:  Button   = $UI/BackButton

var _player = null
var _hud        = null
var _slot_grid  = null
var _player_sprite_proxy: Node2D        = null
var _proxy_anim:          AnimatedSprite2D = null

# ── Live tile presence (see other players sharing this tile) ─────────────
# Real WebSocket connection (Cloudflare Worker + Durable Object, one room
# per tile_id — see godot-projects/farm-game/realtime/). Position updates
# push instantly instead of the old ~1.2s HTTP-poll model.
const REALTIME_URL := "wss://foxstead-realtime.gumbuogw3.workers.dev/room/"
const PRESENCE_SEND_SEC := 0.2

var _ws: WebSocketPeer = null
var _presence_send_accum: float = 0.0
var _remote_players: Dictionary = {}  # wallet -> RemotePlayer node

# ── Combat (click a live player on the same tile to challenge them) ──────
const CHALLENGE_CLICK_RADIUS := 40.0
var _active_combat: bool = false

# ── Action queue ─────────────────────────────────────────────
# Each entry: { grid_pos, action, item_id, world_pos }
# action values: "harvest" | "plant" | "place" | "pickup" | "action"
var _action_queue:  Array      = []
var _current_task:  Dictionary = {}
var _repath_attempt: int       = 0
var _dot_layer:  CanvasLayer  = null
var _queue_dots: Dictionary   = {}

const _SLOT_PX  := 64.0
const _SLOT_GAP := 4.0
# Standard non-pond grid dimensions (matches slot_grid.gd FULL_COLS/ROW_LAYOUT)
const _GRID_COLS := 8
const _GRID_ROWS := 6
# Approach offsets tried when direct path is blocked (world units = screen px at 1:1 zoom)
const _REPATH_OFFSETS: Array = [
	Vector2(  0, -68), Vector2(  0,  68),
	Vector2(-68,   0), Vector2( 68,   0),
	Vector2(-68, -68), Vector2( 68,  68),
]

# ── Tile-to-tile navigation ───────────────────────────────────
# Pointy-top hex, 6 neighbor directions. Matches the "odd-r" offset layout
# used by the world map (WorldMap.gd _hex_pixel_pos) — neighbor offsets
# depend on whether the current row is even or odd.
const _NAV_DIRS_EVEN_ROW := {
	"NE": Vector2i( 0, -1), "E": Vector2i( 1,  0), "SE": Vector2i( 0,  1),
	"SW": Vector2i(-1,  1), "W": Vector2i(-1,  0), "NW": Vector2i(-1, -1),
}
const _NAV_DIRS_ODD_ROW := {
	"NE": Vector2i( 1, -1), "E": Vector2i( 1,  0), "SE": Vector2i( 1,  1),
	"SW": Vector2i( 0,  1), "W": Vector2i(-1,  0), "NW": Vector2i( 0, -1),
}
# Screen px the character walks to before the scene transition fires
const _NAV_WALK_SCREEN := {
	"NW": Vector2(420, 110), "NE": Vector2(860, 110),
	"W":  Vector2(160, 360), "E":  Vector2(1120, 360),
	"SW": Vector2(420, 610), "SE": Vector2(860, 610),
}
const _NAV_ARROW := {
	"NW": "◤", "NE": "◥", "W": "◄", "E": "►", "SW": "◣", "SE": "◢",
}
# Top-left position of each button inside the CanvasLayer (1280×720).
# NW/NE pair together top-center, SW/SE pair together bottom-center
# (lifted clear of the HUD's bottom bar, which spans y:664-712), and
# W/E sit at the far sides — none overlap the tool slot columns
# (x:150-270, x:1010-1130).
const _NAV_BTN_POS := {
	"NW": Vector2(490,   4), "NE": Vector2(646,   4),
	"W":  Vector2(  4, 332), "E":  Vector2(1136, 332),
	"SW": Vector2(490, 616), "SE": Vector2(646, 616),
}
var _nav_layer: CanvasLayer = null

static func _hex_neighbor(pos: Vector2i, dir: String) -> Vector2i:
	var offs: Dictionary = _NAV_DIRS_ODD_ROW if (pos.y % 2 == 1) else _NAV_DIRS_EVEN_ROW
	return pos + offs.get(dir, Vector2i.ZERO)

func _ready() -> void:
	tile_id   = LandManager.current_tile_id
	tile_data = LandManager.tiles.get(tile_id, {})
	add_to_group("tile_scene")
	_spawn_player()
	_spawn_hud()
	_spawn_slot_grid()
	_spawn_dot_layer()
	_spawn_nav_arrows()
	_spawn_presence_system()
	_player.arrived.connect(_on_player_arrived)
	_player.path_cancelled.connect(_on_path_cancelled)

func _spawn_player() -> void:
	_player = (load(PLAYER_SCENE_PATH) as PackedScene).instantiate()
	_player.tile_id  = tile_id
	_player.position = _entry_spawn_position()
	add_child(_player)
	# Hide the original sprite (still animates and fires signals; we draw a
	# mirror in CanvasLayer 2 so it always appears above slot items at layer 1).
	_player.sprite.visible = false

	var pl_canvas := CanvasLayer.new()
	pl_canvas.layer = 6
	pl_canvas.follow_viewport_enabled = true
	add_child(pl_canvas)

	_player_sprite_proxy = Node2D.new()
	pl_canvas.add_child(_player_sprite_proxy)

	_proxy_anim = AnimatedSprite2D.new()
	_proxy_anim.sprite_frames = _player.sprite.sprite_frames
	_proxy_anim.scale         = _player.sprite.scale
	_proxy_anim.offset        = _player.sprite.offset
	_player_sprite_proxy.add_child(_proxy_anim)

func _entry_spawn_position() -> Vector2:
	var side: String = LandManager.pending_entry_side
	LandManager.pending_entry_side = ""
	if side != "" and _NAV_WALK_SCREEN.has(side):
		var sp: Vector2 = _NAV_WALK_SCREEN[side]
		return get_viewport().get_canvas_transform().affine_inverse() * sp
	return player_spawn.position if player_spawn else Vector2(640, 360)

func _process(delta: float) -> void:
	_poll_presence(delta)
	if not is_instance_valid(_player) or not is_instance_valid(_proxy_anim):
		return
	# Sync proxy position and visual state from the hidden original sprite.
	_player_sprite_proxy.position = _player.global_position
	if _proxy_anim.animation != _player.sprite.animation or not _proxy_anim.is_playing():
		_proxy_anim.play(_player.sprite.animation)
	_proxy_anim.frame = _player.sprite.frame

func _spawn_hud() -> void:
	_hud = (load(HUD_SCENE_PATH) as PackedScene).instantiate()
	add_child(_hud)

func _spawn_slot_grid() -> void:
	_slot_grid = (load(SLOT_GRID_SCENE_PATH) as PackedScene).instantiate()
	add_child(_slot_grid)
	_slot_grid.setup(tile_id)
	_slot_grid.slot_activated.connect(_on_slot_activated)

# ── World position for a slot cell ───────────────────────────

func _slot_center_world(grid_pos: Vector2i) -> Vector2:
	# Sprite offset is (0,-46) at scale 1.2 → visual center is ~55px above position.
	# Shift target down so the sprite body centers on the slot instead of floating above it.
	const SPRITE_VISUAL_OFFSET_Y := 46.0 * 1.2  # 55.2 px

	if LandManager.is_tool_slot_pos(grid_pos) and is_instance_valid(_slot_grid):
		var idx: int = LandManager.tool_slot_index(grid_pos)
		var tool_screen_pos: Vector2 = _slot_grid.call("tool_slot_screen_center", idx)
		tool_screen_pos.y += SPRITE_VISUAL_OFFSET_Y
		return get_viewport().get_canvas_transform().affine_inverse() * tool_screen_pos

	var step: float   = _SLOT_PX + _SLOT_GAP
	var grid_w: float = _GRID_COLS * step - _SLOT_GAP
	var grid_h: float = _GRID_ROWS * step - _SLOT_GAP
	var origin := Vector2((1280.0 - grid_w) / 2.0, 558.0 - grid_h)
	var screen_pos := origin + Vector2(
		grid_pos.x * step + _SLOT_PX * 0.5,
		grid_pos.y * step + _SLOT_PX * 0.5 + SPRITE_VISUAL_OFFSET_Y
	)
	return get_viewport().get_canvas_transform().affine_inverse() * screen_pos

# ── Queue management ─────────────────────────────────────────

func _on_slot_activated(grid_pos: Vector2i, action: String, item_id: String) -> void:
	var world_pos := _slot_center_world(grid_pos)
	_action_queue.append({
		"grid_pos":  grid_pos,
		"action":    action,
		"item_id":   item_id,
		"world_pos": world_pos,
	})
	_add_queue_dot(grid_pos)
	if _current_task.is_empty():
		_start_next_task()

func _on_path_cancelled() -> void:
	if not _current_task.is_empty() and _repath_attempt < _REPATH_OFFSETS.size():
		# Try an offset approach angle to the same target before giving up
		var base: Vector2 = _current_task.get("world_pos", Vector2.ZERO)
		_player.move_to(base + _REPATH_OFFSETS[_repath_attempt])
		_repath_attempt += 1
		return
	# All offsets exhausted — skip this task and try the next queued one
	_remove_queue_dot(_current_task.get("grid_pos", Vector2i(-1, -1)))
	_repath_attempt = 0
	_current_task = {}
	_start_next_task()

func _start_next_task() -> void:
	if _action_queue.is_empty():
		return
	_repath_attempt = 0
	_current_task = _action_queue.pop_front()
	_player.move_to(_current_task["world_pos"])

func _on_player_arrived(at_pos: Vector2) -> void:
	if _current_task.is_empty():
		return
	var world_pos: Vector2 = _current_task.get("world_pos", Vector2(-9999.0, -9999.0))
	if at_pos.distance_to(world_pos) > 80.0:
		_finish_task()
		return
	_repath_attempt = 0
	_execute_current_task()

func _finish_task() -> void:
	if _current_task.is_empty():
		return
	_remove_queue_dot(_current_task.get("grid_pos", Vector2i(-1, -1)))
	_repath_attempt = 0
	_current_task = {}
	_start_next_task()

# ── Execute the task at the front of the queue ───────────────

func _execute_current_task() -> void:
	var gp:     Vector2i  = _current_task.get("grid_pos",  Vector2i(-1, -1))
	var action: String    = _current_task.get("action",    "")
	var iid:    String    = _current_task.get("item_id",   "")
	var wpos:   Vector2   = _current_task.get("world_pos", Vector2.ZERO)
	var slots: Dictionary = LandManager.tiles.get(tile_id, {}).get("slots", {})
	var key: String       = LandManager.slot_key(gp)

	match action:
		"harvest":
			if not slots.has(key) or slots[key].get("state", "") != "ready":
				_finish_task()
				return
			_player.play_harvest()
			await _player.sprite.animation_finished
			var crop: String = LandManager.harvest_crop(tile_id, gp)
			if crop != "":
				var amt: int = randi_range(4, 7)
				if PlayerData.has_farming_boost() or PlayerData.has_apple_boost():
					amt += 1
				if PlayerData.has_peach_boost():
					amt = max(6, amt)
				# Visitors on someone else's tile split the harvest with the
				# owner (same yield_rate mechanic used for chopping/mining).
				# A won combat-rights holder counts as the effective owner too.
				var owner_id: String = LandManager.tiles.get(tile_id, {}).get("owner_id", "")
				var is_owner: bool = owner_id.is_empty() or LandManager.is_effective_owner(tile_id, PlayerData.player_id)
				var you_amt: int = amt
				var owner_amt: int = 0
				if not is_owner:
					var yield_rate: int = LandManager.tiles.get(tile_id, {}).get("yield_rate", 70)
					you_amt = int(amt * yield_rate / 100.0)
					owner_amt = amt - you_amt
				ResourceManager.add_item(crop, you_amt, true)  # silent — drops_popup handles notification
				if owner_amt > 0:
					LandManager.add_to_passive_vault(tile_id, crop, owner_amt, PlayerData.player_id)
				_show_harvest_drops_popup(crop, you_amt, owner_amt)
				if is_instance_valid(_slot_grid):
					_slot_grid.call("_refresh_picker")

		"plant":
			if not ResourceManager.has_item(iid):
				_finish_task()
				return
			var adat: Dictionary = slots.get(key, {})
			if not (adat.get("is_anchor", false) \
					and adat.get("item_id", "") == "soil_plot" \
					and not adat.has("crop")):
				_finish_task()
				return
			_player.play_harvest()
			await _player.sprite.animation_finished
			if LandManager.plant_seed(tile_id, gp, iid):
				ResourceManager.remove_item(iid)
				if is_instance_valid(_slot_grid):
					_slot_grid.call("_refresh_picker")

		"place":
			if slots.has(key) or not ResourceManager.has_item(iid):
				_finish_task()
				return
			_player.play_harvest()
			await _player.sprite.animation_finished
			if LandManager.place_slot_item(tile_id, gp, iid):
				ResourceManager.remove_item(iid)
				if is_instance_valid(_slot_grid):
					_slot_grid.call("_refresh_picker")

		"place_tool":
			if slots.has(key) or not ResourceManager.has_item(iid):
				_finish_task()
				return
			_player.play_harvest()
			await _player.sprite.animation_finished
			if LandManager.place_tool_item(tile_id, LandManager.tool_slot_index(gp), iid):
				ResourceManager.remove_item(iid)
				if is_instance_valid(_slot_grid):
					_slot_grid.call("_refresh_picker")

		"choose_seed":
			var adat: Dictionary = slots.get(key, {})
			if not (adat.get("is_anchor", false) and adat.get("item_id", "") == "soil_plot" and not adat.has("crop")):
				_finish_task()
				return
			if not is_instance_valid(_slot_grid) or not _slot_grid.call("show_choice_popup", "seed"):
				_finish_task()
				return
			var chosen_seed: String = await _slot_grid.item_chosen
			if chosen_seed == "" or not ResourceManager.has_item(chosen_seed):
				_finish_task()
				return
			_player.play_harvest()
			await _player.sprite.animation_finished
			if LandManager.plant_seed(tile_id, gp, chosen_seed):
				ResourceManager.remove_item(chosen_seed)
				if is_instance_valid(_slot_grid):
					_slot_grid.call("_refresh_picker")

		"choose_tool":
			if slots.has(key):
				_finish_task()
				return
			if not is_instance_valid(_slot_grid) or not _slot_grid.call("show_choice_popup", "tool"):
				_finish_task()
				return
			var chosen_tool: String = await _slot_grid.item_chosen
			if chosen_tool == "" or not ResourceManager.has_item(chosen_tool):
				_finish_task()
				return
			_player.play_harvest()
			await _player.sprite.animation_finished
			if LandManager.place_tool_item(tile_id, LandManager.tool_slot_index(gp), chosen_tool):
				ResourceManager.remove_item(chosen_tool)
				if is_instance_valid(_slot_grid):
					_slot_grid.call("_refresh_picker")

		"open_station":
			if not slots.has(key):
				_finish_task()
				return
			if is_instance_valid(_slot_grid):
				_slot_grid.call("_open_crafting_station", iid, gp)

		"choose_farm":
			if slots.has(key):
				_finish_task()
				return
			if not is_instance_valid(_slot_grid) or not _slot_grid.call("show_choice_popup", "farm"):
				_finish_task()
				return
			var chosen_farm: String = await _slot_grid.item_chosen
			if chosen_farm == "" or not ResourceManager.has_item(chosen_farm):
				_finish_task()
				return
			_player.play_harvest()
			await _player.sprite.animation_finished
			if LandManager.place_slot_item(tile_id, gp, chosen_farm):
				ResourceManager.remove_item(chosen_farm)
				if is_instance_valid(_slot_grid):
					_slot_grid.call("_refresh_picker")

		"pickup":
			if not slots.has(key):
				_finish_task()
				return
			_player.play_harvest()
			await _player.sprite.animation_finished
			var removed: String = LandManager.remove_slot_item(tile_id, gp)
			if removed != "":
				var picked_id: String = removed.trim_prefix("wild_")
				ResourceManager.add_item(picked_id, 1, true)  # silent — drops_popup handles notification
				_show_drops_popup("Picked up", picked_id, 1)

		"action":
			_player.play_harvest()
			await _player.sprite.animation_finished
			var aw_script: GDScript = load("res://scripts/ui/action_window.gd")
			var aw = CanvasLayer.new()
			aw.set_script(aw_script)
			aw.layer = 30
			add_child(aw)
			var popup_pos := Vector2(
				clamp(wpos.x + 40.0, 0.0, 1080.0),
				clamp(wpos.y - 60.0, 0.0, 580.0)
			)
			aw.open(gp, iid, popup_pos, tile_id)
			# Resume queue after action window closes
			aw.tree_exiting.connect(func(): _finish_task())
			return

		"travel":
			_close_stray_popups()
			_send_leave_presence()
			PlayerData.save_data()
			ResourceManager.save_inventory()
			LandManager.save_land_data()
			LandManager.current_tile_id = iid
			var dir: String = _current_task.get("dir", "")
			LandManager.pending_entry_side = _OPPOSITE_DIR.get(dir, "")
			var scene_path: String = _tile_scene_path(LandManager.tiles.get(iid, {}).get("type", 0))
			if scene_path != "":
				get_tree().change_scene_to_file(scene_path)
			return

	_finish_task()

# Several popups (chicken coop, beehive, mailbox, wine press, barrel,
# bread oven) are parented directly to get_tree().root so they render
# above everything — but that also means change_scene_to_file() never
# frees them if they're left open. Any node still stuck in the
# "action_windows" group would then block all input on every tile
# visited afterward, forever. Force-close them before any scene change.
func _close_stray_popups() -> void:
	for node in get_tree().get_nodes_in_group("action_windows"):
		if is_instance_valid(node):
			node.remove_from_group("action_windows")
			node.queue_free()

func _on_back_button_pressed() -> void:
	_close_stray_popups()
	_send_leave_presence()
	PlayerData.save_data()
	ResourceManager.save_inventory()
	LandManager.save_land_data()
	get_tree().change_scene_to_file("res://scenes/world_map/WorldMap.tscn")

# ── Tile-to-tile navigation ───────────────────────────────────

func _spawn_nav_arrows() -> void:
	_nav_layer = CanvasLayer.new()
	_nav_layer.layer = 8
	add_child(_nav_layer)
	var my_pos: Vector2i = tile_data.get("position", Vector2i(-1, -1))
	if my_pos.x < 0:
		return
	for dir in _NAV_ARROW:
		var nbr_pos: Vector2i = _hex_neighbor(my_pos, dir)
		var nbr_id: String = LandManager.grid.get(nbr_pos, "")
		if nbr_id == "" or nbr_id == LandManager.GLOBAL_TILE_ID:
			continue
		if not LandManager.can_enter_tile(nbr_id, PlayerData.player_id, ""):
			continue
		var nbr: Dictionary = LandManager.tiles.get(nbr_id, {})
		var nbr_name: String = nbr.get("name", "")
		if nbr_name == "":
			nbr_name = nbr.get("type_str", "Tile").capitalize()
		var btn := Button.new()
		btn.text = "%s  %s" % [_NAV_ARROW[dir], nbr_name]
		btn.add_theme_font_size_override("font_size", 9)
		btn.custom_minimum_size = Vector2(140, 32)
		btn.position = _NAV_BTN_POS[dir]
		btn.mouse_filter = Control.MOUSE_FILTER_STOP
		var sb := StyleBoxFlat.new()
		sb.bg_color = Color(0.0, 0.05, 0.15, 0.82)
		sb.border_color = Color(0.35, 0.70, 1.0, 0.90)
		sb.set_border_width_all(1)
		sb.set_corner_radius_all(6)
		btn.add_theme_stylebox_override("normal",  sb)
		btn.add_theme_stylebox_override("hover",   sb)
		btn.add_theme_stylebox_override("pressed", sb)
		btn.add_theme_color_override("font_color", Color(0.55, 0.88, 1.0))
		var dest_id: String = nbr_id
		var d: String = dir
		btn.pressed.connect(func() -> void: _queue_travel(dest_id, d))
		_nav_layer.add_child(btn)

const _OPPOSITE_DIR := {
	"NE": "SW", "SW": "NE", "E": "W", "W": "E", "SE": "NW", "NW": "SE",
}

func _queue_travel(dest_tile_id: String, dir: String) -> void:
	var sp: Vector2 = _NAV_WALK_SCREEN.get(dir, Vector2(640, 360))
	var world_pos: Vector2 = get_viewport().get_canvas_transform().affine_inverse() * sp
	_action_queue.append({
		"grid_pos":  Vector2i(-1, -1),
		"action":    "travel",
		"item_id":   dest_tile_id,
		"world_pos": world_pos,
		"dir":       dir,
	})
	if _current_task.is_empty():
		_start_next_task()

func _tile_scene_path(tile_type: int) -> String:
	match tile_type:
		LandManager.TileType.FARM:     return "res://scenes/tiles/FarmTile.tscn"
		LandManager.TileType.FOREST:   return "res://scenes/tiles/ForestTile.tscn"
		LandManager.TileType.MOUNTAIN: return "res://scenes/tiles/MountainTile.tscn"
		LandManager.TileType.POND:     return "res://scenes/tiles/PondTile.tscn"
	return ""

func fast_travel_to_npc(npc_id: String) -> void:
	var target_tile_id := NPCManager.get_npc_tile_id(npc_id)
	if target_tile_id == "" or target_tile_id == tile_id:
		return
	PlayerData.save_data()
	get_tree().change_scene_to_file("res://scenes/world_map/WorldMap.tscn")

func _show_drops_popup(label: String, item_id: String, count: int) -> void:
	var ui: CanvasLayer = (load("res://scripts/ui/drops_popup.gd") as GDScript).new()
	get_tree().root.add_child(ui)
	ui.show_drops([{"label": label, "items": [{"id": item_id, "count": count}]}])

# Same as _show_drops_popup but breaks the amount into "You" / "Owner gets"
# groups, matching the popup action_window.gd already uses for chop/mine.
func _show_harvest_drops_popup(item_id: String, you_amt: int, owner_amt: int) -> void:
	var drops: Array = [
		{"label": "You", "color": Color(0.4, 1.0, 0.5), "items": [{"id": item_id, "count": you_amt}]}
	]
	if owner_amt > 0:
		drops.append({"label": "Owner gets", "color": Color(1.0, 0.85, 0.3), "items": [{"id": item_id, "count": owner_amt}]})
	var ui: CanvasLayer = (load("res://scripts/ui/drops_popup.gd") as GDScript).new()
	get_tree().root.add_child(ui)
	ui.show_drops(drops)

# ── Slot queue dot indicators ─────────────────────────────────

func _spawn_dot_layer() -> void:
	_dot_layer = CanvasLayer.new()
	_dot_layer.layer = 4
	add_child(_dot_layer)

# ── Live tile presence ─────────────────────────────────────────
# Real WebSocket connection to a Cloudflare Durable Object room (one room
# per tile_id — see godot-projects/farm-game/realtime/). Position updates
# push both ways instantly instead of the old ~1.2s HTTP-poll model;
# closing the socket on scene exit is itself the "I left" signal, the room
# broadcasts the leave to everyone else automatically.
func _spawn_presence_system() -> void:
	if PlayerData.player_id == "":
		return
	_ws = WebSocketPeer.new()
	_ws.connect_to_url(REALTIME_URL + tile_id.uri_encode())
	# Give presence a moment to populate _remote_players before checking
	# whether the current combat-rights holder is actually still here.
	var t := get_tree().create_timer(1.5)
	t.timeout.connect(_maybe_claim_uncontested_rights)

# Called every _process() tick — see the existing _process() override below.
func _poll_presence(delta: float) -> void:
	if _ws == null or not is_instance_valid(_player):
		return
	_ws.poll()
	var state: WebSocketPeer.State = _ws.get_ready_state()
	if state != WebSocketPeer.STATE_OPEN:
		return

	while _ws.get_available_packet_count() > 0:
		var packet: PackedByteArray = _ws.get_packet()
		_handle_realtime_message(packet.get_string_from_utf8())

	_presence_send_accum += delta
	if _presence_send_accum >= PRESENCE_SEND_SEC:
		_presence_send_accum = 0.0
		var body := JSON.stringify({
			"type":   "presence",
			"wallet": PlayerData.player_id,
			"name":   PlayerData.player_name,
			"x":      _player.global_position.x,
			"y":      _player.global_position.y,
			"facing": _player.facing,
		})
		_ws.send_text(body)

func _handle_realtime_message(text: String) -> void:
	var json := JSON.new()
	if json.parse(text) != OK:
		return
	var data = json.get_data()
	if not (data is Dictionary and data.has("type")):
		return

	if data["type"] == "presence":
		var w: String = str(data.get("wallet", ""))
		if w == "" or w == PlayerData.player_id:
			return
		var node = _remote_players.get(w)
		if node == null or not is_instance_valid(node):
			node = Node2D.new()
			node.set_script(load(REMOTE_PLAYER_SCRIPT))
			node.wallet = w
			add_child(node)
			_remote_players[w] = node
		node.set_player_name(str(data.get("name", "Player")))
		node.update_target(Vector2(data.get("x", 0.0), data.get("y", 0.0)), str(data.get("facing", "south")))
		return

	if data["type"] == "challenge":
		var att: String = str(data.get("attacker", ""))
		var dfn: String = str(data.get("defender", ""))
		var ts: int = int(data.get("ts", 0))
		# Only the defender reacts here — the attacker already started their
		# own local sim the moment they confirmed the challenge, and the room
		# never echoes a message back to whoever sent it, so there's no
		# double-trigger risk on the attacker's own client.
		if dfn == PlayerData.player_id and att != PlayerData.player_id:
			_run_combat(att, dfn, ts)
		return

	if data["type"] == "leave":
		var lw: String = str(data.get("wallet", ""))
		var node = _remote_players.get(lw)
		if node != null and is_instance_valid(node):
			node.queue_free()
		_remote_players.erase(lw)

# Called right before any scene change — closing the socket is the leave
# signal, the room's onClose broadcasts it to everyone else on the tile.
func _send_leave_presence() -> void:
	if _ws != null:
		_ws.close()

# ── Combat ────────────────────────────────────────────────────
# Click a live player sharing this tile to challenge them. Fight rights on
# public tiles: winner becomes the tile's combat_rights_holder (treated as
# full owner for yield-split purposes — see LandManager.is_effective_owner),
# loser gets sent to their home tile.

func _unhandled_input(event: InputEvent) -> void:
	if event is InputEventMouseButton and event.pressed and event.button_index == MOUSE_BUTTON_LEFT:
		_try_challenge_click(get_viewport().get_mouse_position())

# Returns true if the click landed on a live remote player and was handled
# (used by pond_tile.gd, which overrides _unhandled_input itself for water
# clicks — it checks this first so clicking a player standing near the
# water starts a fight instead of casting a line).
func _try_challenge_click(screen_pos: Vector2) -> bool:
	if _active_combat or not is_instance_valid(_player):
		return false
	var world_pos: Vector2 = get_viewport().get_canvas_transform().affine_inverse() * screen_pos
	for w in _remote_players.keys():
		var node = _remote_players[w]
		if not is_instance_valid(node):
			continue
		if node.global_position.distance_to(world_pos) <= CHALLENGE_CLICK_RADIUS:
			get_viewport().set_input_as_handled()
			_show_challenge_confirm(w, node.get_display_name())
			return true
	return false

func _show_challenge_confirm(defender_wallet: String, defender_name: String) -> void:
	var layer := CanvasLayer.new()
	layer.layer = 45
	add_child(layer)

	var dim := ColorRect.new()
	dim.set_anchors_preset(Control.PRESET_FULL_RECT)
	dim.color = Color(0, 0, 0, 0.55)
	dim.mouse_filter = Control.MOUSE_FILTER_STOP
	layer.add_child(dim)

	var pw := 320.0; var ph := 140.0
	var panel := Control.new()
	panel.position = Vector2((1280.0 - pw) / 2.0, (720.0 - ph) / 2.0)
	panel.size = Vector2(pw, ph)
	dim.add_child(panel)

	var border := ColorRect.new()
	border.set_anchors_preset(Control.PRESET_FULL_RECT)
	border.color = Color(0.65, 0.15, 0.15, 0.95)
	border.mouse_filter = Control.MOUSE_FILTER_IGNORE
	panel.add_child(border)

	var inner := ColorRect.new()
	inner.position = Vector2(2, 2)
	inner.size = Vector2(pw - 4, ph - 4)
	inner.color = Color(0.07, 0.07, 0.09, 0.98)
	inner.mouse_filter = Control.MOUSE_FILTER_IGNORE
	panel.add_child(inner)

	var lbl := Label.new()
	lbl.text = "Fight %s?" % defender_name
	lbl.position = Vector2(10, 16)
	lbl.size = Vector2(pw - 20, 30)
	lbl.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	lbl.add_theme_font_size_override("font_size", 14)
	lbl.add_theme_color_override("font_color", Color(1.0, 0.75, 0.55))
	panel.add_child(lbl)

	var sub := Label.new()
	sub.text = "Winner takes farming rights on this tile."
	sub.position = Vector2(10, 48)
	sub.size = Vector2(pw - 20, 20)
	sub.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	sub.add_theme_font_size_override("font_size", 9)
	sub.add_theme_color_override("font_color", Color(0.65, 0.65, 0.65))
	panel.add_child(sub)

	var yes_btn := Button.new()
	yes_btn.text = "Fight"
	yes_btn.position = Vector2(30, 92)
	yes_btn.size = Vector2(110, 32)
	yes_btn.pressed.connect(func():
		layer.queue_free()
		_start_combat(defender_wallet)
	)
	panel.add_child(yes_btn)

	var no_btn := Button.new()
	no_btn.text = "Not now"
	no_btn.position = Vector2(pw - 140, 92)
	no_btn.size = Vector2(110, 32)
	no_btn.pressed.connect(func(): layer.queue_free())
	panel.add_child(no_btn)

func _start_combat(defender_wallet: String) -> void:
	var attacker_wallet: String = PlayerData.player_id
	var ts := int(Time.get_unix_time_from_system())
	if _ws != null and _ws.get_ready_state() == WebSocketPeer.STATE_OPEN:
		_ws.send_text(JSON.stringify({
			"type": "challenge", "attacker": attacker_wallet, "defender": defender_wallet, "ts": ts,
		}))
	_run_combat(attacker_wallet, defender_wallet, ts)

func _get_combat_actor(wallet: String):
	if wallet == PlayerData.player_id:
		return _player
	return _remote_players.get(wallet)

func _run_combat(attacker_wallet: String, defender_wallet: String, ts: int) -> void:
	if _active_combat:
		return
	var attacker_node = _get_combat_actor(attacker_wallet)
	var defender_node = _get_combat_actor(defender_wallet)
	if attacker_node == null or defender_node == null or not is_instance_valid(attacker_node) or not is_instance_valid(defender_node):
		return

	var sim: Dictionary = CombatSim.simulate(attacker_wallet, defender_wallet, ts)
	_active_combat = true
	attacker_node.enter_combat()
	defender_node.enter_combat()
	attacker_node.play_combat_anim("fight_idle")
	defender_node.play_combat_anim("fight_idle")
	await get_tree().create_timer(0.6).timeout

	for round_data in sim["rounds"]:
		if not (is_instance_valid(attacker_node) and is_instance_valid(defender_node)):
			break
		var is_attacker_turn: bool = round_data["attacker"] == attacker_wallet
		var atk_node = attacker_node if is_attacker_turn else defender_node
		var def_node = defender_node if is_attacker_turn else attacker_node
		atk_node.play_combat_anim(round_data["move"])
		if round_data["hit"]:
			await get_tree().create_timer(0.35).timeout
			if is_instance_valid(def_node):
				def_node.play_combat_anim("hit_react")
		await get_tree().create_timer(0.55).timeout

	var winner: String = sim["winner"]
	var loser: String = defender_wallet if winner == attacker_wallet else attacker_wallet
	var loser_node = attacker_node if loser == attacker_wallet else defender_node
	var winner_node = defender_node if loser == attacker_wallet else attacker_node
	if is_instance_valid(loser_node):
		loser_node.play_combat_anim("death")
	if is_instance_valid(winner_node):
		winner_node.play_combat_anim("fight_idle")
	await get_tree().create_timer(1.2).timeout

	if is_instance_valid(attacker_node):
		attacker_node.exit_combat()
	if is_instance_valid(defender_node):
		defender_node.exit_combat()
	_active_combat = false

	var my_wallet: String = PlayerData.player_id
	if winner == my_wallet:
		LandManager.set_combat_rights_holder(tile_id, my_wallet)
	if loser == my_wallet:
		_go_home_after_loss()

# Only meaningful on a tile you don't own: if the current combat-rights
# holder isn't physically here (checked via live presence), the next
# different visitor takes over uncontested — no fight needed against
# someone who isn't around to defend it. See the rule design notes; this
# is what stops an absent holder from permanently squatting a tile.
func _maybe_claim_uncontested_rights() -> void:
	var my_wallet: String = PlayerData.player_id
	if my_wallet == "" or tile_id == "":
		return
	var td: Dictionary = LandManager.tiles.get(tile_id, {})
	if td.get("owner_id", "") == my_wallet:
		return  # you already have full rights as the actual owner
	var holder: String = td.get("combat_rights_holder", "")
	if holder == "" or holder == my_wallet:
		return
	if _remote_players.has(holder):
		return  # holder is still here — must be challenged, not auto-claimed
	LandManager.set_combat_rights_holder(tile_id, my_wallet)

func _go_home_after_loss() -> void:
	var home: String = LandManager.home_tile_id
	if home == "" or home == tile_id:
		return
	_close_stray_popups()
	_send_leave_presence()
	PlayerData.save_data()
	ResourceManager.save_inventory()
	LandManager.save_land_data()
	LandManager.current_tile_id = home
	var scene_path: String = _tile_scene_path(LandManager.tiles.get(home, {}).get("type", 0))
	if scene_path != "":
		get_tree().change_scene_to_file(scene_path)

func _slot_screen_pos(grid_pos: Vector2i) -> Vector2:
	var step := _SLOT_PX + _SLOT_GAP
	var grid_w := _GRID_COLS * step - _SLOT_GAP
	var grid_h := _GRID_ROWS * step - _SLOT_GAP
	var origin := Vector2((1280.0 - grid_w) / 2.0, 558.0 - grid_h)
	return origin + Vector2(grid_pos.x * step + _SLOT_PX * 0.5, grid_pos.y * step + _SLOT_PX * 0.5)

func _add_queue_dot(grid_pos: Vector2i) -> void:
	var key := "%d,%d" % [grid_pos.x, grid_pos.y]
	if _queue_dots.has(key) or not is_instance_valid(_dot_layer):
		return
	var sp := _slot_screen_pos(grid_pos)
	var highlight := ColorRect.new()
	highlight.color       = Color(0.10, 0.90, 0.55, 0.45)
	highlight.position    = sp - Vector2(_SLOT_PX * 0.5, _SLOT_PX * 0.5)
	highlight.size        = Vector2(_SLOT_PX, _SLOT_PX)
	highlight.mouse_filter = Control.MOUSE_FILTER_IGNORE
	_dot_layer.add_child(highlight)
	# Gentle pulse so it's easy to spot
	var tw := highlight.create_tween()
	tw.set_loops()
	tw.tween_property(highlight, "modulate:a", 0.45, 0.55).set_ease(Tween.EASE_IN_OUT)
	tw.tween_property(highlight, "modulate:a", 1.00, 0.55).set_ease(Tween.EASE_IN_OUT)
	_queue_dots[key] = highlight

func _remove_queue_dot(grid_pos: Vector2i) -> void:
	var key := "%d,%d" % [grid_pos.x, grid_pos.y]
	if _queue_dots.has(key):
		var node = _queue_dots[key]
		if is_instance_valid(node):
			node.queue_free()
		_queue_dots.erase(key)
