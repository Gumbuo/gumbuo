extends Node2D

const PLAYER_SCENE := preload("res://scenes/player/Player.tscn")
const HUD_SCENE := preload("res://scenes/ui/HUD.tscn")
const SLOT_GRID_SCENE := preload("res://scenes/tiles/SlotGrid.tscn")

@onready var body_rect: ColorRect = $Body
@onready var name_lbl: Label = $NameLabel
@onready var shop_lbl: Label = $ShopLabel
@onready var desc_lbl: Label = $DescLabel
@onready var silver_lbl: Label = $UI/SilverLabel
@onready var talk_btn: Button = $UI/TalkBtn
@onready var player_spawn: Marker2D = $PlayerSpawn

var _npc_id: String = ""
var _shop: CanvasLayer = null
var _player: CharacterBody2D = null
var _hud: CanvasLayer = null
var _slot_grid: CanvasLayer = null

func _ready() -> void:
	_npc_id = LandManager.current_tile_id.trim_prefix("npc_")
	var npc_data := NPCManager.get_npc(_npc_id)
	if not npc_data.is_empty():
		NPCManager.discover_npc(_npc_id)
		var c: Array = npc_data.get("color", [0.5, 0.5, 0.5])
		body_rect.color = Color(c[0], c[1], c[2])
		name_lbl.text = npc_data.get("name", "???")
		shop_lbl.text = npc_data.get("shop_name", "Shop")
		desc_lbl.text = npc_data.get("description", "")
		talk_btn.text = "Talk to " + npc_data.get("name", "NPC")
		_load_portrait(npc_data)
		_refresh_silver()
	var head := get_node_or_null("Head")
	var body := get_node_or_null("Body")
	if head: head.visible = false
	if body: body.visible = false
	_spawn_player()
	_spawn_hud()
	_spawn_slot_grid()

func _spawn_player() -> void:
	_player = PLAYER_SCENE.instantiate()
	_player.tile_id = LandManager.GLOBAL_TILE_ID
	_player.position = player_spawn.position if player_spawn else Vector2(350, 500)
	add_child(_player)

func _spawn_hud() -> void:
	_hud = HUD_SCENE.instantiate()
	add_child(_hud)

func _spawn_slot_grid() -> void:
	_slot_grid = SLOT_GRID_SCENE.instantiate()
	add_child(_slot_grid)
	_slot_grid.setup(LandManager.GLOBAL_TILE_ID)

func _load_portrait(npc_data: Dictionary) -> void:
	var portrait_path: String = npc_data.get("portrait", "")
	if portrait_path == "" or not ResourceLoader.exists(portrait_path):
		return
	var tex: Texture2D = load(portrait_path)
	if tex == null:
		return
	var head := get_node_or_null("Head")
	var body := get_node_or_null("Body")
	if head: head.visible = false
	if body: body.visible = false
	var tr := TextureRect.new()
	tr.texture = tex
	tr.expand_mode = TextureRect.EXPAND_KEEP_SIZE
	tr.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
	tr.position = Vector2(576, 200)
	tr.size = Vector2(128, 160)
	tr.z_index = -1
	add_child(tr)

func _refresh_silver() -> void:
	silver_lbl.text = "Silver: %d" % PlayerData.silver

func _on_talk_pressed() -> void:
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

func _on_back_pressed() -> void:
	PlayerData.save_data()
	ResourceManager.save_inventory()
	LandManager.save_land_data()
	get_tree().change_scene_to_file("res://scenes/world_map/WorldMap.tscn")
