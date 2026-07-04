extends Node2D

const TILE_CARD_SCENE := preload("res://scenes/world_map/TileCard.tscn")
const TILE_CARD_SIZE := Vector2(90, 90)
const TILE_CARD_GAP := Vector2(0, 0)
const GRID_COLS := 10
const GRID_ROWS := 10

@onready var grid_container: Control = $UI/Scroll/GridContainer
@onready var kingdom_label: Label = $UI/KingdomLabel

var _cards: Dictionary = {}
var _dragging_tile_id: String = ""
var _drag_origin: Vector2i = Vector2i(-1, -1)
var _shop_ui: CanvasLayer = null
var _npc_positions: Array = []

func _ready() -> void:
	LandManager.tile_placed.connect(_on_tile_placed)
	LandManager.tile_moved.connect(_on_tile_moved)
	LandManager.tile_settings_changed.connect(_on_tile_settings_changed)
	_build_grid()
	_refresh_all_tiles()
	_place_npc_tiles()
	_update_kingdom_label()

func _build_grid() -> void:
	grid_container.custom_minimum_size = Vector2(GRID_COLS * TILE_CARD_SIZE.x, GRID_ROWS * TILE_CARD_SIZE.y)
	for y in GRID_ROWS:
		for x in GRID_COLS:
			var pos := Vector2i(x, y)
			var card: Control = TILE_CARD_SCENE.instantiate()
			card.position = Vector2(x * TILE_CARD_SIZE.x, y * TILE_CARD_SIZE.y)
			card.grid_position = pos
			card.enter_requested.connect(_on_enter_tile)
			card.npc_shop_requested.connect(_on_npc_shop_requested)
			card.drag_started.connect(_on_drag_started)
			card.drop_requested.connect(_on_drop_requested)
			card.edit_requested.connect(_on_edit_tile)
			grid_container.add_child(card)
			_cards[pos] = card

func _refresh_all_tiles() -> void:
	for tile_data in LandManager.get_player_tiles():
		var pos: Vector2i = tile_data["position"]
		if _cards.has(pos):
			_cards[pos].set_tile(tile_data)

func _place_npc_tiles() -> void:
	for pos in _npc_positions:
		if _cards.has(pos) and _cards[pos].is_npc_tile():
			_cards[pos].set_empty()
	_npc_positions.clear()
	for npc_data in NPCManager.get_all_map_npcs():
		var type_str: String = npc_data.get("npc_tile_type", "")
		var pos: Vector2i = Vector2i(-1, -1)
		if type_str != "":
			pos = _find_npc_pos_for_type(type_str)
		if pos.x < 0:
			pos = npc_data.get("map_position", Vector2i(-1, -1))
		if pos.x < 0 or not _cards.has(pos):
			continue
		if not _cards[pos].is_empty_cell():
			continue
		_cards[pos].set_npc_tile(npc_data)
		_npc_positions.append(pos)

func _find_npc_pos_for_type(type_str: String) -> Vector2i:
	var target_pos: Vector2i = Vector2i(-1, -1)
	for tile_data in LandManager.get_player_tiles():
		if tile_data.get("type_str", "") == type_str:
			target_pos = tile_data["position"]
			break
	if target_pos.x < 0:
		return Vector2i(-1, -1)
	for offset in [Vector2i(1, 0), Vector2i(-1, 0), Vector2i(0, 1), Vector2i(0, -1)]:
		var candidate: Vector2i = target_pos + offset
		if _cards.has(candidate) and _cards[candidate].is_empty_cell():
			return candidate
	return Vector2i(-1, -1)

func _on_enter_tile(tile_id: String) -> void:
	var tile_data: Dictionary = LandManager.tiles.get(tile_id, {})
	if tile_data.is_empty():
		return
	if not LandManager.can_enter_tile(tile_id, PlayerData.player_id, ""):
		return
	_load_tile_scene(tile_data)

func _on_npc_shop_requested(npc_id: String) -> void:
	NPCManager.discover_npc(npc_id)
	var npc_data: Dictionary = NPCManager.get_npc(npc_id)
	if npc_data.is_empty():
		return
	if _shop_ui != null:
		_shop_ui.queue_free()
	var shop_script: GDScript = load("res://scripts/ui/shop_ui.gd")
	_shop_ui = CanvasLayer.new()
	_shop_ui.set_script(shop_script)
	_shop_ui.layer = 20
	add_child(_shop_ui)
	_shop_ui.setup(npc_data)
	_shop_ui.closed.connect(_on_shop_closed)

func _on_shop_closed() -> void:
	if _shop_ui != null:
		_shop_ui.queue_free()
		_shop_ui = null

func _load_tile_scene(tile_data_in: Dictionary) -> void:
	var scene_path: String = _get_tile_scene_path(int(tile_data_in["type"]))
	if scene_path == "":
		return
	LandManager.current_tile_id = tile_data_in["id"]
	get_tree().change_scene_to_file(scene_path)

func _get_tile_scene_path(tile_type: int) -> String:
	match tile_type:
		LandManager.TileType.FARM:     return "res://scenes/tiles/FarmTile.tscn"
		LandManager.TileType.FOREST:   return "res://scenes/tiles/ForestTile.tscn"
		LandManager.TileType.MOUNTAIN: return "res://scenes/tiles/MountainTile.tscn"
		LandManager.TileType.POND:     return "res://scenes/tiles/PondTile.tscn"
	return ""

func _input(event: InputEvent) -> void:
	if _dragging_tile_id != "" and event is InputEventKey and event.pressed and event.keycode == KEY_ESCAPE:
		_dragging_tile_id = ""
		_drag_origin = Vector2i(-1, -1)
		_update_card_move_states()
		get_viewport().set_input_as_handled()

func _on_drag_started(tile_id: String, from_pos: Vector2i) -> void:
	if _dragging_tile_id == tile_id:
		# clicking the already-selected tile cancels the move
		_dragging_tile_id = ""
		_drag_origin = Vector2i(-1, -1)
	else:
		_dragging_tile_id = tile_id
		_drag_origin = from_pos
	_update_card_move_states()

func _on_drop_requested(to_pos: Vector2i) -> void:
	if _dragging_tile_id == "" or _drag_origin == to_pos:
		_dragging_tile_id = ""
		_drag_origin = Vector2i(-1, -1)
		_update_card_move_states()
		return
	if LandManager.move_tile(_dragging_tile_id, to_pos):
		if _cards.has(_drag_origin):
			_cards[_drag_origin].set_empty()
		if _cards.has(to_pos):
			_cards[to_pos].set_tile(LandManager.tiles[_dragging_tile_id])
		_place_npc_tiles()
	_dragging_tile_id = ""
	_drag_origin = Vector2i(-1, -1)
	_update_card_move_states()

func _update_card_move_states() -> void:
	var moving: bool = _dragging_tile_id != ""
	for pos in _cards:
		var card = _cards[pos]
		card.set_selected(false)
		card.set_drop_target(moving and card.is_empty_cell())
	if moving and _cards.has(_drag_origin):
		_cards[_drag_origin].set_selected(true)

func _on_edit_tile(tile_id: String) -> void:
	var settings: CanvasLayer = CanvasLayer.new()
	settings.set_script(load("res://scripts/ui/tile_settings_ui.gd"))
	settings.layer = 25
	add_child(settings)
	settings.open(tile_id)

func _on_tile_placed(tile_data: Dictionary) -> void:
	var pos: Vector2i = tile_data["position"]
	if _cards.has(pos):
		_cards[pos].set_tile(tile_data)
	_place_npc_tiles()
	_update_kingdom_label()

func _on_tile_moved(_tile_id: String, _new_pos: Vector2i) -> void:
	_update_kingdom_label()

func _on_tile_settings_changed(tile_id: String) -> void:
	var tile_data: Dictionary = LandManager.tiles.get(tile_id, {})
	if tile_data.is_empty():
		return
	var pos: Vector2i = tile_data["position"]
	if _cards.has(pos):
		_cards[pos].set_tile(tile_data)

func _update_kingdom_label() -> void:
	var tier := LandManager.get_kingdom_tier()
	var tier_names := ["", "Homestead", "Village", "Town", "City", "Kingdom"]
	kingdom_label.text = "%s (Tier %d)" % [tier_names[tier], tier]
