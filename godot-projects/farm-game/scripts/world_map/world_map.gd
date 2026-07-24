extends Node3D

const GLOBE_TILE_SCENE := preload("res://scenes/world_map/GlobeTile.tscn")
const HUD_SCENE        := preload("res://scenes/ui/HUD.tscn")
const GRID_COLS := 30
const GRID_ROWS := 25
const API_URL := "https://univershole.ink/api/farm-world"

const PLANET_RADIUS := 14.0
const MAX_LAT_DEG := 68.0
const TILE_WORLD_SIZE := 2.0
const TILE_LIFT := 0.05
const CAM_START_Z := 30.0
const CAM_MIN_Z := 17.0
const CAM_MAX_Z := 50.0
const ZOOM_STEP := 2.0
const DRAG_ROTATE_SPEED := 0.006
const CLICK_MOVE_THRESHOLD := 6.0
const PITCH_LIMIT := 1.35

@onready var kingdom_label: Label = $UI/KingdomLabel
@onready var _ui_layer: CanvasLayer = $UI

var _cards: Dictionary = {}
var _dragging_tile_id: String = ""
var _drag_origin: Vector2i = Vector2i(-1, -1)
var _shop_ui: CanvasLayer = null
var _npc_positions: Array = []
var _deed_picker: CanvasLayer = null
var _tile_menu: CanvasLayer = null
var _world_req: HTTPRequest = null
var _sync_req: HTTPRequest = null
var _deed_banner: Label = null

var _globe: Node3D = null
var _tiles_root: Node3D = null
var _camera: Camera3D = null
var _yaw: float = 0.0
var _pitch: float = -0.25
var _drag_active: bool = false
var _drag_moved: bool = false
var _press_mouse: Vector2 = Vector2.ZERO
var _last_mouse: Vector2 = Vector2.ZERO

func _ready() -> void:
	if LandManager.current_tile_id != "":
		LandManager.last_tile_id = LandManager.current_tile_id
	LandManager.current_tile_id = ""
	LandManager.tile_placed.connect(_on_tile_placed)
	LandManager.tile_moved.connect(_on_tile_moved)
	LandManager.tile_removed.connect(_on_tile_removed)
	LandManager.tile_settings_changed.connect(_on_tile_settings_changed)
	_setup_3d_scene()
	_build_globe_grid()
	_refresh_all_tiles()
	_place_npc_tiles()
	_update_kingdom_label()
	_refresh_deed_hints()
	_spawn_deed_banner()
	_spawn_hud()
	LandManager.deed_earned.connect(func(_t): _refresh_deed_banner())
	call_deferred("_face_home_tile")
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
		_deed_banner.text = "Deeds in wallet: %s  —  tap any empty hex to place" % "  |  ".join(parts)
		_deed_banner.modulate = Color(0.55, 1.0, 0.40)
		_deed_banner.visible = true


# ── 3D globe scaffolding: camera, lighting, starfield, planet body ───────

func _setup_3d_scene() -> void:
	var env := Environment.new()
	env.background_mode = Environment.BG_COLOR
	env.background_color = Color(0.01, 0.01, 0.03)
	env.ambient_light_source = Environment.AMBIENT_SOURCE_COLOR
	env.ambient_light_color = Color(0.35, 0.38, 0.42)
	env.ambient_light_energy = 0.6
	var world_env := WorldEnvironment.new()
	world_env.environment = env
	add_child(world_env)

	var sun := DirectionalLight3D.new()
	sun.rotation_degrees = Vector3(-35, -35, 0)
	sun.light_energy = 1.1
	add_child(sun)

	_camera = Camera3D.new()
	_camera.position = Vector3(0, 0, CAM_START_Z)
	_camera.fov = 45.0
	add_child(_camera)

	_build_starfield()

	_globe = Node3D.new()
	add_child(_globe)
	_apply_globe_rotation()

	_build_planet()

	_tiles_root = Node3D.new()
	_globe.add_child(_tiles_root)

func _build_planet() -> void:
	var sphere := SphereMesh.new()
	sphere.radius = PLANET_RADIUS
	sphere.height = PLANET_RADIUS * 2.0
	sphere.radial_segments = 48
	sphere.rings = 32
	var mat := StandardMaterial3D.new()
	mat.albedo_color = Color(0.14, 0.20, 0.15)
	mat.roughness = 0.95
	var mesh_inst := MeshInstance3D.new()
	mesh_inst.mesh = sphere
	mesh_inst.material_override = mat
	_globe.add_child(mesh_inst)

func _build_starfield() -> void:
	var star_mesh := QuadMesh.new()
	star_mesh.size = Vector2(0.5, 0.5)
	var mat := StandardMaterial3D.new()
	mat.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
	mat.albedo_color = Color(1, 1, 1, 0.95)
	mat.billboard_mode = BaseMaterial3D.BILLBOARD_ENABLED
	mat.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
	star_mesh.material = mat

	var mm := MultiMesh.new()
	mm.transform_format = MultiMesh.TRANSFORM_3D
	mm.mesh = star_mesh
	var count := 500
	mm.instance_count = count
	var rng := RandomNumberGenerator.new()
	rng.seed = 1337
	for i in count:
		var dir := Vector3(rng.randf_range(-1.0, 1.0), rng.randf_range(-1.0, 1.0), rng.randf_range(-1.0, 1.0))
		if dir.length() < 0.001:
			dir = Vector3.UP
		dir = dir.normalized()
		var dist: float = rng.randf_range(70.0, 120.0)
		var s: float = rng.randf_range(0.3, 1.3)
		var t := Transform3D(Basis().scaled(Vector3.ONE * s), dir * dist)
		mm.set_instance_transform(i, t)

	var mmi := MultiMeshInstance3D.new()
	mmi.multimesh = mm
	add_child(mmi)


# ── Hex-on-sphere placement ───────────────────────────────────────────────
# Reuses the existing flat Vector2i(col,row) grid from LandManager/NPCManager
# unchanged (no data migration) — columns wrap 360° around the equator, rows
# span a clamped latitude band so tiles never crush together at true poles.
# The rectangular grid's column/row spacing don't perfectly match a sphere's
# geometry, so tiles have mild gaps near the equator and mild overlap near
# the latitude limits — a known cosmetic tradeoff for keeping tile positions
# compatible with what's already saved locally and on the server.

func _sphere_point(pos: Vector2i) -> Dictionary:
	var lon: float = (float(pos.x) / float(GRID_COLS)) * TAU
	var t: float = float(pos.y) / float(max(GRID_ROWS - 1, 1))
	var lat: float = deg_to_rad(lerp(MAX_LAT_DEG, -MAX_LAT_DEG, t))
	var cos_lat: float = cos(lat)
	var dir := Vector3(cos_lat * cos(lon), sin(lat), cos_lat * sin(lon))
	return {"dir": dir, "lat": lat, "lon": lon, "cos_lat": cos_lat}

func _sphere_transform(pos: Vector2i) -> Transform3D:
	var sp: Dictionary = _sphere_point(pos)
	var normal: Vector3 = sp["dir"]
	var ref_up: Vector3 = Vector3.UP if abs(normal.dot(Vector3.UP)) < 0.999 else Vector3.RIGHT
	var tangent_x: Vector3 = ref_up.cross(normal).normalized()
	var tangent_z: Vector3 = normal.cross(tangent_x).normalized()
	var shrink: float = clamp(float(sp["cos_lat"]), 0.35, 1.0)
	var s: float = TILE_WORLD_SIZE * shrink
	var basis := Basis(tangent_x * s, normal, tangent_z * s)
	var origin: Vector3 = normal * (PLANET_RADIUS + TILE_LIFT)
	return Transform3D(basis, origin)

func _build_globe_grid() -> void:
	for y in GRID_ROWS:
		for x in GRID_COLS:
			var pos := Vector2i(x, y)
			var tile: GlobeTile = GLOBE_TILE_SCENE.instantiate()
			_tiles_root.add_child(tile)
			tile.transform = _sphere_transform(pos)
			tile.grid_position = pos
			_cards[pos] = tile

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


# ── Input: drag to orbit the globe, click (no drag) to pick a tile ───────

func _unhandled_input(event: InputEvent) -> void:
	if _dragging_tile_id != "" and event is InputEventKey and event.pressed and event.keycode == KEY_ESCAPE:
		_dragging_tile_id = ""
		_drag_origin = Vector2i(-1, -1)
		_update_card_move_states()
		get_viewport().set_input_as_handled()
		return

	if event is InputEventMouseButton and event.button_index == MOUSE_BUTTON_LEFT:
		if event.pressed:
			_drag_active = true
			_drag_moved = false
			_press_mouse = event.position
			_last_mouse = event.position
			get_viewport().set_input_as_handled()
		elif _drag_active:
			_drag_active = false
			if not _drag_moved:
				_try_pick(event.position)
			get_viewport().set_input_as_handled()
	elif event is InputEventMouseMotion and _drag_active:
		var delta: Vector2 = event.position - _last_mouse
		_last_mouse = event.position
		if event.position.distance_to(_press_mouse) > CLICK_MOVE_THRESHOLD:
			_drag_moved = true
		_yaw -= delta.x * DRAG_ROTATE_SPEED
		_pitch = clamp(_pitch - delta.y * DRAG_ROTATE_SPEED, -PITCH_LIMIT, PITCH_LIMIT)
		_apply_globe_rotation()
		get_viewport().set_input_as_handled()
	elif event is InputEventMouseButton and event.pressed and event.button_index == MOUSE_BUTTON_WHEEL_UP:
		_zoom(-1)
		get_viewport().set_input_as_handled()
	elif event is InputEventMouseButton and event.pressed and event.button_index == MOUSE_BUTTON_WHEEL_DOWN:
		_zoom(1)
		get_viewport().set_input_as_handled()

func _apply_globe_rotation() -> void:
	if _globe:
		_globe.transform.basis = Basis(Vector3.UP, _yaw) * Basis(Vector3.RIGHT, _pitch)

func _zoom(dir: int) -> void:
	if not _camera:
		return
	_camera.position.z = clamp(_camera.position.z + dir * ZOOM_STEP, CAM_MIN_Z, CAM_MAX_Z)

func _try_pick(screen_pos: Vector2) -> void:
	if not _camera:
		return
	var from: Vector3 = _camera.project_ray_origin(screen_pos)
	var dir: Vector3 = _camera.project_ray_normal(screen_pos)
	var space_state := get_world_3d().direct_space_state
	var query := PhysicsRayQueryParameters3D.create(from, from + dir * (PLANET_RADIUS + CAM_MAX_Z))
	var result: Dictionary = space_state.intersect_ray(query)
	if result.is_empty():
		_close_tile_menu()
		_close_deed_picker()
		return
	var tile: GlobeTile = result.get("collider") as GlobeTile
	if tile == null:
		return
	_on_tile_clicked(tile)

func _on_tile_clicked(tile: GlobeTile) -> void:
	_close_deed_picker()
	if tile.is_npc_tile():
		_close_tile_menu()
		_on_npc_shop_requested(tile.get_npc_id())
		return
	if tile.is_empty_cell():
		_close_tile_menu()
		_on_drop_requested(tile.grid_position)
		return
	_show_tile_menu(tile)


# ── Filled-tile action menu (Enter / Edit / Move) ─────────────────────────
# Replaces the old always-on corner buttons from the flat map — with tiles
# now picked via raycast on a rotating globe, a single click opens a small
# menu instead of relying on tiny always-visible per-tile hitboxes.

func _show_tile_menu(tile: GlobeTile) -> void:
	_close_tile_menu()
	var tile_id: String = tile.get_tile_id()
	var tile_data: Dictionary = LandManager.tiles.get(tile_id, {})
	if tile_data.is_empty():
		return
	var is_owner: bool = tile.get_is_owner()
	var can_enter: bool = LandManager.can_enter_tile(tile_id, PlayerData.player_id, "")

	_tile_menu = CanvasLayer.new()
	_tile_menu.layer = 28
	add_child(_tile_menu)

	var panel := PanelContainer.new()
	var sb := StyleBoxFlat.new()
	sb.bg_color = Color(0.10, 0.12, 0.10, 0.96)
	sb.border_color = Color(0.30, 0.70, 0.30)
	sb.set_border_width_all(2)
	sb.set_corner_radius_all(8)
	panel.add_theme_stylebox_override("panel", sb)
	panel.custom_minimum_size = Vector2(180, 0)
	_tile_menu.add_child(panel)

	var vbox := VBoxContainer.new()
	vbox.add_theme_constant_override("separation", 6)
	panel.add_child(vbox)

	var title := Label.new()
	var display_name: String = tile_data.get("name", "")
	if display_name == "":
		display_name = String(tile_data.get("type_str", "Tile")).capitalize()
	title.text = display_name
	title.add_theme_font_size_override("font_size", 13)
	title.modulate = Color(0.55, 0.90, 0.40)
	title.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	vbox.add_child(title)

	if can_enter:
		var enter_btn := Button.new()
		enter_btn.text = "Enter"
		enter_btn.pressed.connect(func() -> void:
			_close_tile_menu()
			_load_tile_scene(tile_data)
		)
		vbox.add_child(enter_btn)

	if is_owner:
		var edit_btn := Button.new()
		edit_btn.text = "Edit / Rename"
		edit_btn.pressed.connect(func() -> void:
			_close_tile_menu()
			_on_edit_tile(tile_id)
		)
		vbox.add_child(edit_btn)

		var move_btn := Button.new()
		move_btn.text = "Cancel Move" if _dragging_tile_id == tile_id else "Move"
		move_btn.pressed.connect(func() -> void:
			_close_tile_menu()
			_on_drag_started(tile_id, tile.grid_position)
		)
		vbox.add_child(move_btn)

	var close_btn := Button.new()
	close_btn.text = "Cancel"
	close_btn.modulate = Color(0.6, 0.6, 0.6)
	close_btn.pressed.connect(_close_tile_menu)
	vbox.add_child(close_btn)

	panel.position = Vector2(560, 220)

func _close_tile_menu() -> void:
	if is_instance_valid(_tile_menu):
		_tile_menu.queue_free()
	_tile_menu = null

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
			"combat_rights_holder": td.get("combat_rights_holder", ""),
			"combat_rights_since":  td.get("combat_rights_since", 0),
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
		"combat_rights_holder": td.get("combat_rights_holder", ""),
		"combat_rights_since":  td.get("combat_rights_since", 0),
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

func _face_home_tile() -> void:
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
	var sp: Dictionary = _sphere_point(pos)
	_yaw = -float(sp["lon"])
	_pitch = clamp(-float(sp["lat"]), -PITCH_LIMIT, PITCH_LIMIT)
	_apply_globe_rotation()
