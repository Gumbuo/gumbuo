extends Node2D

const TILE_CARD_SCENE := preload("res://scenes/world_map/TileCard.tscn")
const TILE_CARD_SIZE := Vector2(90, 90)
const TILE_CARD_GAP := Vector2(0, 0)
const GRID_COLS := 10
const GRID_ROWS := 10

@onready var grid_container: Control = $UI/Scroll/GridContainer
@onready var kingdom_label: Label = $UI/KingdomLabel
@onready var _ui_layer: CanvasLayer = $UI

var _cards: Dictionary = {}
var _dragging_tile_id: String = ""
var _drag_origin: Vector2i = Vector2i(-1, -1)
var _shop_ui: CanvasLayer = null
var _npc_positions: Array = []
var _deed_picker: Control = null

func _ready() -> void:
	LandManager.tile_placed.connect(_on_tile_placed)
	LandManager.tile_moved.connect(_on_tile_moved)
	LandManager.tile_settings_changed.connect(_on_tile_settings_changed)
	_build_grid()
	_refresh_all_tiles()
	_place_npc_tiles()
	_update_kingdom_label()
	_refresh_deed_hints()

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
	for tid in LandManager.tiles:
		var tile_data: Dictionary = LandManager.tiles[tid]
		var pos: Vector2i = tile_data.get("position", Vector2i(-1, -1))
		if pos.x >= 0 and _cards.has(pos):
			_cards[pos].set_tile(tile_data)

func _place_npc_tiles() -> void:
	for pos in _npc_positions:
		if _cards.has(pos) and _cards[pos].is_npc_tile():
			_cards[pos].set_empty()
	_npc_positions.clear()
	for npc_data in NPCManager.get_all_map_npcs():
		var pos: Vector2i = npc_data.get("map_position", Vector2i(-1, -1))
		if pos.x < 0 or not _cards.has(pos):
			continue
		_cards[pos].set_npc_tile(npc_data)
		_npc_positions.append(pos)

func _on_enter_tile(tile_id: String) -> void:
	var tile_data: Dictionary = LandManager.tiles.get(tile_id, {})
	if tile_data.is_empty():
		return
	if not LandManager.can_enter_tile(tile_id, PlayerData.player_id, ""):
		return
	_load_tile_scene(tile_data)

func _close_deed_picker() -> void:
	if is_instance_valid(_deed_picker):
		_deed_picker.queue_free()
	_deed_picker = null

func _on_npc_shop_requested(npc_id: String) -> void:
	_close_deed_picker()
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
	if _dragging_tile_id == "":
		var has_deeds := false
		for ts in LandManager.deed_inventory:
			if LandManager.deed_inventory[ts] > 0 and ts in LandManager.TileType:
				has_deeds = true
				break
		if has_deeds:
			_show_deed_picker(to_pos)
		return
	if _drag_origin == to_pos:
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
	_close_deed_picker()
	var settings: CanvasLayer = CanvasLayer.new()
	settings.set_script(load("res://scripts/ui/tile_settings_ui.gd"))
	settings.layer = 25
	add_child(settings)
	settings.open(tile_id)

func _show_deed_picker(grid_pos: Vector2i) -> void:
	if _deed_picker != null:
		_deed_picker.queue_free()
		_deed_picker = null
		return

	var deeds_owned: Dictionary = {}
	for ts in LandManager.deed_inventory:
		var cnt: int = LandManager.deed_inventory[ts]
		if cnt > 0 and ts in LandManager.TileType:
			deeds_owned[ts] = cnt
	if deeds_owned.is_empty():
		return

	var DEED_COLORS := {
		"FARM":     Color(0.40, 0.70, 0.30),
		"FOREST":   Color(0.20, 0.50, 0.20),
		"MOUNTAIN": Color(0.50, 0.40, 0.30),
		"POND":     Color(0.20, 0.40, 0.70),
	}

	var panel := PanelContainer.new()
	var sb := StyleBoxFlat.new()
	sb.bg_color = Color(0.10, 0.12, 0.10, 0.96)
	sb.border_color = Color(0.30, 0.70, 0.30)
	sb.set_border_width_all(2)
	sb.set_corner_radius_all(8)
	panel.add_theme_stylebox_override("panel", sb)
	panel.custom_minimum_size = Vector2(160, 0)
	panel.position = Vector2(560, 270)

	var vbox := VBoxContainer.new()
	vbox.add_theme_constant_override("separation", 6)
	panel.add_child(vbox)

	var title := Label.new()
	title.text = "Place a Tile"
	title.add_theme_font_size_override("font_size", 12)
	title.modulate = Color(0.55, 0.90, 0.40)
	title.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	vbox.add_child(title)

	for ts in deeds_owned:
		var cnt: int = deeds_owned[ts]
		var btn := Button.new()
		btn.text = "%s  x%d" % [ts.capitalize(), cnt]
		btn.add_theme_font_size_override("font_size", 11)
		var bsb := StyleBoxFlat.new()
		bsb.bg_color = DEED_COLORS.get(ts, Color(0.4, 0.4, 0.4))
		bsb.set_corner_radius_all(6)
		bsb.content_margin_left = 10; bsb.content_margin_right = 10
		bsb.content_margin_top = 4;   bsb.content_margin_bottom = 4
		btn.add_theme_stylebox_override("normal", bsb)
		btn.pressed.connect(func() -> void:
			var ttype: LandManager.TileType = LandManager.TileType[ts]
			LandManager.place_tile(ttype, grid_pos)
			_close_deed_picker()
		)
		vbox.add_child(btn)

	var close_btn := Button.new()
	close_btn.text = "Cancel"
	close_btn.add_theme_font_size_override("font_size", 10)
	close_btn.modulate = Color(0.6, 0.6, 0.6)
	close_btn.pressed.connect(_close_deed_picker)
	vbox.add_child(close_btn)

	_deed_picker = panel
	_ui_layer.add_child(panel)

func _on_tile_placed(tile_data: Dictionary) -> void:
	var pos: Vector2i = tile_data["position"]
	if _cards.has(pos):
		_cards[pos].set_tile(tile_data)
	_place_npc_tiles()
	_update_kingdom_label()
	_refresh_deed_hints()

func _refresh_deed_hints() -> void:
	var has_deeds := false
	for ts in LandManager.deed_inventory:
		if LandManager.deed_inventory[ts] > 0 and ts in LandManager.TileType:
			has_deeds = true
			break
	for pos in _cards:
		var card = _cards[pos]
		if card.is_empty_cell():
			card.set_deed_hint(has_deeds)

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
