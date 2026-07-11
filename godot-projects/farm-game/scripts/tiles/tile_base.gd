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

const _SLOT_PX  := 64.0
const _SLOT_GAP := 4.0

func _ready() -> void:
	tile_id   = LandManager.current_tile_id
	tile_data = LandManager.tiles.get(tile_id, {})
	add_to_group("tile_scene")
	_spawn_player()
	_spawn_hud()
	_spawn_slot_grid()
	_player.arrived.connect(_on_player_arrived)
	_player.path_cancelled.connect(_on_path_cancelled)

func _spawn_player() -> void:
	_player = (load(PLAYER_SCENE_PATH) as PackedScene).instantiate()
	_player.tile_id  = tile_id
	_player.position = player_spawn.position if player_spawn else Vector2(640, 360)
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
	var cols: int   = LandManager.SLOT_COLS
	var rows: int   = LandManager.SLOT_ROWS
	var grid_w: float = cols * (_SLOT_PX + _SLOT_GAP) - _SLOT_GAP
	var grid_h: float = rows * (_SLOT_PX + _SLOT_GAP) - _SLOT_GAP
	var origin := Vector2((1280.0 - grid_w) / 2.0, 558.0 - grid_h)
	var screen_pos := origin + Vector2(
		grid_pos.x * (_SLOT_PX + _SLOT_GAP) + _SLOT_PX * 0.5,
		grid_pos.y * (_SLOT_PX + _SLOT_GAP) + _SLOT_PX * 0.5
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
	if _current_task.is_empty():
		_start_next_task()

func _on_path_cancelled() -> void:
	_action_queue.clear()
	_current_task = {}

func _start_next_task() -> void:
	if _action_queue.is_empty():
		return
	_current_task = _action_queue.pop_front()
	_player.move_to(_current_task["world_pos"])

func _on_player_arrived(at_pos: Vector2) -> void:
	if _current_task.is_empty():
		return
	var world_pos: Vector2 = _current_task.get("world_pos", Vector2(-9999.0, -9999.0))
	if at_pos.distance_to(world_pos) > 80.0:
		_finish_task()
		return
	_execute_current_task()

func _finish_task() -> void:
	if _current_task.is_empty():
		return
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
				ResourceManager.add_item(crop, amt)
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
				ResourceManager.add_item(removed.trim_prefix("wild_"), 1)

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

	_finish_task()

func _on_back_button_pressed() -> void:
	PlayerData.save_data()
	ResourceManager.save_inventory()
	LandManager.save_land_data()
	get_tree().change_scene_to_file("res://scenes/world_map/WorldMap.tscn")

func fast_travel_to_npc(npc_id: String) -> void:
	var target_tile_id := NPCManager.get_npc_tile_id(npc_id)
	if target_tile_id == "" or target_tile_id == tile_id:
		return
	PlayerData.save_data()
	get_tree().change_scene_to_file("res://scenes/world_map/WorldMap.tscn")
