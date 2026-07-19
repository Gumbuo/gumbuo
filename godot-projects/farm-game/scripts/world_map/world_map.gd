extends Node2D

const TILE_CARD_SCENE := preload("res://scenes/world_map/TileCard.tscn")
const HUD_SCENE        := preload("res://scenes/ui/HUD.tscn")
const TILE_CARD_SIZE := Vector2(90, 90)
const TILE_CARD_GAP := Vector2(0, 0)
const GRID_COLS := 30
const GRID_ROWS := 25
const API_URL := "https://univershole.ink/api/farm-world"

@onready var grid_container: Control = $UI/Scroll/GridContainer
@onready var kingdom_label: Label = $UI/KingdomLabel
@onready var _ui_layer: CanvasLayer = $UI
@onready var _scroll: ScrollContainer = $UI/Scroll

var _cards: Dictionary = {}
var _dragging_tile_id: String = ""
var _drag_origin: Vector2i = Vector2i(-1, -1)
var _shop_ui: CanvasLayer = null
var _npc_positions: Array = []
var _deed_picker: CanvasLayer = null
var _world_req: HTTPRequest = null
var _sync_req: HTTPRequest = null
var _deed_banner: Label = null

func _ready() -> void:
	if LandManager.current_tile_id != "":
		LandManager.last_tile_id = LandManager.current_tile_id
	LandManager.current_tile_id = ""
	LandManager.tile_placed.connect(_on_tile_placed)
	LandManager.tile_moved.connect(_on_tile_moved)
	LandManager.tile_removed.connect(_on_tile_removed)
	LandManager.tile_settings_changed.connect(_on_tile_settings_changed)
	_build_grid()
	_refresh_all_tiles()
	_place_npc_tiles()
	_update_kingdom_label()
	_refresh_deed_hints()
	_spawn_deed_banner()
	_spawn_hud()
	LandManager.deed_earned.connect(func(_t): _refresh_deed_banner())
	call_deferred("_scroll_to_home_tile")
	_world_req = HTTPRequest.new()
	add_child(_world_req)
	_world_req.request_completed.connect(_on_world_tiles_received)
	_sync_req = HTTPRequest.new()
	add_child(_sync_req)
	_world_req.request(API_URL, ["Accept: application/json"])
	# Push all locally-owned tiles so the server stays in sync on every load
	_sync_all_local_tiles()

func _spawn_hud() -> void:
	var hud := HUD_SCENE.instantiate()
	add_child(hud)

func _spawn_deed_banner() -> void:
	_deed_banner = Label.new()
	_deed_banner.add_theme_font_size_override("font_size", 10)
	_deed_banner.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	_deed_banner.set_anchors_preset(Control.PRESET_TOP_WIDE)
	_deed_banner.offset_top  = 4.0
	_deed_banner.offset_bottom = 24.0
	_deed_banner.mouse_filter = Control.MOUSE_FILTER_IGNORE
	_ui_layer.add_child(_deed_banner)
	_refresh_deed_banner()

func _refresh_deed_banner() -> void:
	if not is_instance_valid(_deed_banner):
		return
	var parts: Array = []
	for ts in ["FARM", "FOREST", "MOUNTAIN", "POND"]:
		var cnt: int = LandManager.deed_inventory.get(ts, 0)
		if cnt > 0:
			parts.append("%s x%d" % [ts.capitalize(), cnt])
	if parts.is_empty():
		_deed_banner.text = ""
		_deed_banner.visible = false
	else:
		_deed_banner.text = "Deeds in wallet: %s  —  tap any empty cell to place" % "  |  ".join(parts)
		_deed_banner.modulate = Color(0.55, 1.0, 0.40)
		_deed_banner.visible = true


# Pointy-top hex, "odd-r" offset layout: odd rows shift right by half a tile
# width, rows pack vertically at 3/4 tile height. Grid positions themselves
# stay plain Vector2i(col,row) — only the pixel placement changes, so no
# migration is needed for existing saved tile positions.
const HEX_ROW_H := 0.75  # row-to-row vertical packing, as a fraction of tile height

func _hex_pixel_pos(pos: Vector2i) -> Vector2:
	var offset_x: float = (TILE_CARD_SIZE.x * 0.5) if (pos.y % 2 == 1) else 0.0
	return Vector2(pos.x * TILE_CARD_SIZE.x + offset_x, pos.y * TILE_CARD_SIZE.y * HEX_ROW_H)

func _build_grid() -> void:
	var grid_w: float = GRID_COLS * TILE_CARD_SIZE.x + TILE_CARD_SIZE.x * 0.5
	var grid_h: float = (GRID_ROWS - 1) * TILE_CARD_SIZE.y * HEX_ROW_H + TILE_CARD_SIZE.y
	grid_container.custom_minimum_size = Vector2(grid_w, grid_h)
	for y in GRID_ROWS:
		for x in GRID_COLS:
			var pos := Vector2i(x, y)
			var card: Control = TILE_CARD_SCENE.instantiate()
			card.position = _hex_pixel_pos(pos)
			card.grid_position = pos
			card.enter_requested.connect(_on_enter_tile)
			card.npc_shop_requested.connect(_on_npc_shop_requested)
			card.drag_started.connect(_on_drag_started)
			card.drop_requested.connect(_on_drop_requested)
			card.edit_requested.connect(_on_edit_tile)
			grid_container.add_child(card)
			_cards[pos] = card

func _npc_position_set() -> Dictionary:
	var result: Dictionary = {}
	for npc_data in NPCManager.get_all_map_npcs():
		var pos: Vector2i = npc_data.get("map_position", Vector2i(-1, -1))
		if pos.x >= 0:
			result[pos] = true
	return result

func _refresh_all_tiles() -> void:
	var npc_positions := _npc_position_set()
	for tid in LandManager.tiles:
		var tile_data: Dictionary = LandManager.tiles[tid]
		var pos: Vector2i = tile_data.get("position", Vector2i(-1, -1))
		if pos.x < 0 or not _cards.has(pos): continue
		if npc_positions.has(pos): continue  # NPC spots always render via _place_npc_tiles()
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

	_deed_picker = CanvasLayer.new()
	_deed_picker.layer = 30
	add_child(_deed_picker)

	var panel := PanelContainer.new()
	var sb := StyleBoxFlat.new()
	sb.bg_color = Color(0.10, 0.12, 0.10, 0.96)
	sb.border_color = Color(0.30, 0.70, 0.30)
	sb.set_border_width_all(2)
	sb.set_corner_radius_all(8)
	panel.add_theme_stylebox_override("panel", sb)
	panel.custom_minimum_size = Vector2(160, 0)
	_deed_picker.add_child(panel)

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

	# Fixed size — get_combined_minimum_size() returns height=0 before layout
	panel.size = Vector2(160, 250)
	panel.position = Vector2(560, 235)

func _on_world_tiles_received(_result: int, code: int, _headers: PackedStringArray, body: PackedByteArray) -> void:
	if not is_inside_tree():
		return
	var raw := body.get_string_from_utf8()
	print("[WorldMap] tile fetch HTTP %d  body_len=%d" % [code, raw.length()])
	var parsed = JSON.parse_string(raw)
	if not parsed is Dictionary:
		print("[WorldMap] tile fetch parse failed — raw: ", raw.substr(0, 200))
		return
	var remote: Array = parsed.get("tiles", [])
	print("[WorldMap] remote tiles received: %d" % remote.size())
	if remote.is_empty():
		return
	LandManager.merge_remote_tiles(remote)
	_refresh_all_tiles()
	_place_npc_tiles()

func _sync_all_local_tiles() -> void:
	for tile_id in LandManager.tiles:
		if LandManager.is_remote_tile(tile_id) or tile_id == LandManager.GLOBAL_TILE_ID:
			continue
		var td: Dictionary = LandManager.tiles.get(tile_id, {})
		if td.is_empty():
			continue
		var pos: Vector2i = td.get("position", Vector2i(-1, -1))
		var body := JSON.stringify({
			"id":          tile_id,
			"type":        td.get("type", 0),
			"type_str":    td.get("type_str", "FARM"),
			"position":    {"x": pos.x, "y": pos.y},
			"owner_id":    td.get("owner_id", ""),
			"name":        td.get("name", "Tile"),
			"access_mode": td.get("access_mode", 0),
			"yield_rate":  td.get("yield_rate", 70),
			"slots":       td.get("slots", {}),
		})
		var req := HTTPRequest.new()
		add_child(req)
		req.request_completed.connect(func(_r,_c,_h,_b): req.queue_free())
		req.request(API_URL, ["Content-Type: application/json"], HTTPClient.METHOD_POST, body)
		await get_tree().create_timer(0.1).timeout  # stagger to avoid hammering the API

func _sync_tile(tile_id: String) -> void:
	if LandManager.is_remote_tile(tile_id):
		return
	var td: Dictionary = LandManager.tiles.get(tile_id, {})
	if td.is_empty():
		return
	var pos: Vector2i = td.get("position", Vector2i(-1, -1))
	var body := JSON.stringify({
		"id":          tile_id,
		"type":        td.get("type", 0),
		"type_str":    td.get("type_str", "FARM"),
		"position":    {"x": pos.x, "y": pos.y},
		"owner_id":    td.get("owner_id", ""),
		"name":        td.get("name", "Tile"),
		"access_mode": td.get("access_mode", 0),
		"yield_rate":  td.get("yield_rate", 70),
		"slots":       td.get("slots", {}),
	})
	_sync_req.request(API_URL, ["Content-Type: application/json"], HTTPClient.METHOD_POST, body)

func _on_tile_placed(tile_data: Dictionary) -> void:
	var pos: Vector2i = tile_data["position"]
	if _cards.has(pos):
		_cards[pos].set_tile(tile_data)
	_place_npc_tiles()
	_update_kingdom_label()
	_refresh_deed_hints()
	_refresh_deed_banner()
	_sync_tile(tile_data.get("id", ""))

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

func _on_tile_removed(tile_id: String, pos: Vector2i) -> void:
	if _cards.has(pos):
		_cards[pos].set_empty()
	_update_kingdom_label()
	_refresh_deed_hints()
	_delete_tile_from_server(tile_id)

func _delete_tile_from_server(tile_id: String) -> void:
	if tile_id == "" or LandManager.is_remote_tile(tile_id):
		return
	var body := JSON.stringify({"action": "remove", "id": tile_id})
	var req := HTTPRequest.new()
	add_child(req)
	req.request_completed.connect(func(_r, _c, _h, _b): req.queue_free())
	req.request(API_URL, ["Content-Type: application/json"], HTTPClient.METHOD_POST, body)

func _on_tile_moved(tile_id: String, _new_pos: Vector2i) -> void:
	_update_kingdom_label()
	_sync_tile(tile_id)

func _on_tile_settings_changed(tile_id: String) -> void:
	var tile_data: Dictionary = LandManager.tiles.get(tile_id, {})
	if tile_data.is_empty():
		return
	var pos: Vector2i = tile_data["position"]
	if _cards.has(pos) and not _npc_position_set().has(pos):
		_cards[pos].set_tile(tile_data)
	_sync_tile(tile_id)

func _update_kingdom_label() -> void:
	var tier := LandManager.get_kingdom_tier()
	var tier_names := ["", "Homestead", "Village", "Town", "City", "Kingdom"]
	kingdom_label.text = "%s (Tier %d)" % [tier_names[tier], tier]

func _scroll_to_home_tile() -> void:
	var home_id := LandManager.home_tile_id
	if home_id == "":
		for td in LandManager.tiles.values():
			if td.get("owner_id", "") == PlayerData.player_id:
				home_id = td.get("id", "")
				break
	if home_id == "" or not LandManager.tiles.has(home_id):
		return
	var pos: Vector2i = LandManager.tiles[home_id].get("position", Vector2i(-1, -1))
	if pos.x < 0:
		return
	var px_py: Vector2 = _hex_pixel_pos(pos)
	_scroll.scroll_horizontal = int(px_py.x - _scroll.size.x * 0.5 + TILE_CARD_SIZE.x * 0.5)
	_scroll.scroll_vertical   = int(px_py.y - _scroll.size.y * 0.5 + TILE_CARD_SIZE.y * 0.5)
