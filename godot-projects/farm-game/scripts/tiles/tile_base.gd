extends Node2D

const PLAYER_SCENE_PATH    := "res://scenes/player/Player.tscn"
const HUD_SCENE_PATH       := "res://scenes/ui/HUD.tscn"
const SLOT_GRID_SCENE_PATH := "res://scenes/tiles/SlotGrid.tscn"

var tile_id:   String     = ""
var tile_data: Dictionary = {}

@onready var player_spawn: Marker2D = $PlayerSpawn
@onready var back_button:  Button   = $UI/BackButton

var _player = null
var _hud        = null
var _slot_grid  = null
var _player_sprite_proxy: Node2D        = null
var _proxy_anim:          AnimatedSprite2D = null

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
# Standard non-pond grid dimensions (matches slot_grid.gd ROW_LAYOUT which has 6 entries)
const _GRID_COLS := 6
const _GRID_ROWS := 6
# Approach offsets tried when direct path is blocked (world units = screen px at 1:1 zoom)
const _REPATH_OFFSETS: Array = [
	Vector2(  0, -68), Vector2(  0,  68),
	Vector2(-68,   0), Vector2( 68,   0),
	Vector2(-68, -68), Vector2( 68,  68),
]

# ── Tile-to-tile navigation ───────────────────────────────────
const _NAV_DIRS := {
	"up":    Vector2i( 0, -1),
	"down":  Vector2i( 0,  1),
	"left":  Vector2i(-1,  0),
	"right": Vector2i( 1,  0),
}
# Screen px the character walks to before the scene transition fires
const _NAV_WALK_SCREEN := {
	"up":    Vector2(640, 110),
	"down":  Vector2(640, 610),
	"left":  Vector2(160, 360),
	"right": Vector2(1120, 360),
}
const _NAV_ARROW := { "up": "▲", "down": "▼", "left": "◄", "right": "►" }
# Top-left position of each button inside the CanvasLayer (1280×720)
const _NAV_BTN_POS := {
	"up":    Vector2(570,   4),
	"down":  Vector2(570, 684),
	"left":  Vector2(  4, 332),
	"right": Vector2(1136, 332),
}
var _nav_layer: CanvasLayer = null

func _ready() -> void:
	tile_id   = LandManager.current_tile_id
	tile_data = LandManager.tiles.get(tile_id, {})
	add_to_group("tile_scene")
	_spawn_player()
	_spawn_hud()
	_spawn_slot_grid()
	_spawn_dot_layer()
	_spawn_nav_arrows()
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

func _process(_delta: float) -> void:
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
				ResourceManager.add_item(crop, amt, true)  # silent — drops_popup handles notification
				_show_drops_popup("Harvested", crop, amt)
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

func _on_back_button_pressed() -> void:
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
	for dir in _NAV_DIRS:
		var nbr_pos: Vector2i = my_pos + _NAV_DIRS[dir]
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

const _OPPOSITE_DIR := { "up": "down", "down": "up", "left": "right", "right": "left" }

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

# ── Slot queue dot indicators ─────────────────────────────────

func _spawn_dot_layer() -> void:
	_dot_layer = CanvasLayer.new()
	_dot_layer.layer = 4
	add_child(_dot_layer)

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
