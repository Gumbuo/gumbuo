extends Node2D

const PLAYER_SCENE := preload("res://scenes/player/Player.tscn")
const HUD_SCENE := preload("res://scenes/ui/HUD.tscn")
const SLOT_GRID_SCENE := preload("res://scenes/tiles/SlotGrid.tscn")

var tile_id: String = ""
var tile_data: Dictionary = {}

@onready var player_spawn: Marker2D = $PlayerSpawn
@onready var back_button: Button = $UI/BackButton

var _player: CharacterBody2D = null
var _hud: CanvasLayer = null
var _slot_grid: CanvasLayer = null
var _pending: Dictionary = {}

const _SLOT_PX := 64.0
const _SLOT_GAP := 4.0

func _ready() -> void:
	tile_id = LandManager.current_tile_id
	tile_data = LandManager.tiles.get(tile_id, {})
	add_to_group("tile_scene")
	_spawn_player()
	_spawn_hud()
	_spawn_slot_grid()
	_player.arrived.connect(_on_player_arrived)

func _spawn_player() -> void:
	_player = PLAYER_SCENE.instantiate()
	_player.tile_id = tile_id
	_player.position = player_spawn.position if player_spawn else Vector2(640, 360)
	add_child(_player)

func _spawn_hud() -> void:
	_hud = HUD_SCENE.instantiate()
	add_child(_hud)

func _spawn_slot_grid() -> void:
	_slot_grid = SLOT_GRID_SCENE.instantiate()
	add_child(_slot_grid)
	_slot_grid.setup(tile_id)
	_slot_grid.slot_activated.connect(_on_slot_activated)

func _slot_center_world(grid_pos: Vector2i) -> Vector2:
	var cols: int = LandManager.SLOT_COLS
	var rows: int = LandManager.SLOT_ROWS
	var grid_w: float = cols * (_SLOT_PX + _SLOT_GAP) - _SLOT_GAP
	var grid_h: float = rows * (_SLOT_PX + _SLOT_GAP) - _SLOT_GAP
	var origin := Vector2((1280.0 - grid_w) / 2.0, 558.0 - grid_h)
	var screen_pos := origin + Vector2(
		grid_pos.x * (_SLOT_PX + _SLOT_GAP) + _SLOT_PX * 0.5,
		grid_pos.y * (_SLOT_PX + _SLOT_GAP) + _SLOT_PX * 0.5
	)
	return get_viewport().get_canvas_transform().affine_inverse() * screen_pos

func _on_slot_activated(grid_pos: Vector2i, item_id: String) -> void:
	var world_pos := _slot_center_world(grid_pos)
	_player.move_to(world_pos)
	_pending = {"grid_pos": grid_pos, "item_id": item_id, "target": world_pos}

func _on_player_arrived(at_pos: Vector2) -> void:
	if _pending.is_empty():
		return
	var target: Vector2 = _pending.get("target", Vector2(-9999, -9999))
	if at_pos.distance_to(target) > 80.0:
		_pending.clear()
		return
	var gp: Vector2i = _pending["grid_pos"]
	var iid: String = _pending["item_id"]
	_pending.clear()
	var aw_script: GDScript = load("res://scripts/ui/action_window.gd")
	var aw: CanvasLayer = CanvasLayer.new()
	aw.set_script(aw_script)
	aw.layer = 30
	add_child(aw)
	var popup_pos := Vector2(clamp(target.x + 40.0, 0.0, 1080.0), clamp(target.y - 60.0, 0.0, 580.0))
	aw.open(gp, iid, popup_pos, tile_id)

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
