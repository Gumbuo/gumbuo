extends Node2D

const PLAYER_SCENE := preload("res://scenes/player/Player.tscn")
const HUD_SCENE := preload("res://scenes/ui/HUD.tscn")
const SLOT_GRID_SCENE := preload("res://scenes/tiles/SlotGrid.tscn")

const NPC_POSITION := Vector2(640, 320)
const ARRIVE_RADIUS := 60.0
const CLICK_RADIUS := 50.0

@onready var name_lbl: Label = $NameLabel
@onready var shop_lbl: Label = $ShopLabel
@onready var desc_lbl: Label = $DescLabel
@onready var silver_lbl: Label = $UI/SilverLabel
@onready var player_spawn: Marker2D = $PlayerSpawn

var _npc_id: String = ""
var _npc_sprite: Sprite2D = null
var _shop: CanvasLayer = null
var _player: CharacterBody2D = null
var _hud: CanvasLayer = null
var _slot_grid: CanvasLayer = null

func _ready() -> void:
	_npc_id = LandManager.current_tile_id.trim_prefix("npc_")
	var npc_data := NPCManager.get_npc(_npc_id)
	if not npc_data.is_empty():
		NPCManager.discover_npc(_npc_id)
		name_lbl.text = npc_data.get("name", "???")
		shop_lbl.text = npc_data.get("shop_name", "Shop")
		desc_lbl.text = npc_data.get("description", "")
		_spawn_npc_sprite(npc_data)
		_refresh_silver()
	var head := get_node_or_null("Head")
	var body := get_node_or_null("Body")
	if head: head.visible = false
	if body: body.visible = false
	_spawn_player()
	_spawn_hud()
	_spawn_slot_grid()

func _spawn_npc_sprite(npc_data: Dictionary) -> void:
	var standing_path: String = npc_data.get("standing", "")
	if standing_path == "" or not ResourceLoader.exists(standing_path):
		return
	_npc_sprite = Sprite2D.new()
	_npc_sprite.texture = load(standing_path)
	_npc_sprite.position = NPC_POSITION
	_npc_sprite.scale = Vector2(2.0, 2.0)
	add_child(_npc_sprite)

func _spawn_player() -> void:
	_player = PLAYER_SCENE.instantiate()
	_player.tile_id = LandManager.GLOBAL_TILE_ID
	_player.position = player_spawn.position if player_spawn else Vector2(350, 500)
	add_child(_player)
	_player.arrived.connect(_on_player_arrived)

func _spawn_hud() -> void:
	_hud = HUD_SCENE.instantiate()
	add_child(_hud)

func _spawn_slot_grid() -> void:
	_slot_grid = SLOT_GRID_SCENE.instantiate()
	add_child(_slot_grid)
	_slot_grid.setup(LandManager.GLOBAL_TILE_ID)

# ── Click NPC to walk over, then talk automatically on arrival ───────────

func _unhandled_input(event: InputEvent) -> void:
	if not (event is InputEventMouseButton and event.pressed and event.button_index == MOUSE_BUTTON_LEFT):
		return
	if _shop != null and is_instance_valid(_shop):
		return
	var click_pos: Vector2 = get_viewport().get_canvas_transform().affine_inverse() * get_viewport().get_mouse_position()
	get_viewport().set_input_as_handled()
	if click_pos.distance_to(NPC_POSITION) <= CLICK_RADIUS:
		_player.move_to(NPC_POSITION)
	else:
		_player.move_to(click_pos)

func _on_player_arrived(at_pos: Vector2) -> void:
	if at_pos.distance_to(NPC_POSITION) <= ARRIVE_RADIUS:
		_open_shop()

func _open_shop() -> void:
	if _shop != null and is_instance_valid(_shop):
		return
	var npc_data := NPCManager.get_npc(_npc_id)
	if npc_data.is_empty():
		return
	var shop_script: GDScript = load("res://scripts/ui/shop_ui.gd")
	_shop = CanvasLayer.new()
	_shop.set_script(shop_script)
	_shop.layer = 26
	add_child(_shop)
	_shop.setup(npc_data)
	_shop.closed.connect(func():
		_shop.queue_free()
		_shop = null
		_refresh_silver()
	)

func _refresh_silver() -> void:
	silver_lbl.text = "Silver: %d" % PlayerData.silver

func _on_back_pressed() -> void:
	PlayerData.save_data()
	ResourceManager.save_inventory()
	LandManager.save_land_data()
	get_tree().change_scene_to_file("res://scenes/world_map/WorldMap.tscn")
