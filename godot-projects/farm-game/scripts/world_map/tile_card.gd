extends Control

signal enter_requested(tile_id: String)
signal npc_shop_requested(npc_id: String)
signal drag_started(tile_id: String, from_pos: Vector2i)
signal drop_requested(to_pos: Vector2i)
signal edit_requested(tile_id: String)

@export var grid_position: Vector2i = Vector2i(0, 0)

@onready var bg_image: TextureRect = $BgImage
@onready var bg_rect: ColorRect = $BgRect

const TILE_TEXTURES: Dictionary = {
	"FARM":     "res://assets/sprites/tiles/world_tile_farm.png",
	"FOREST":   "res://assets/sprites/tiles/world_tile_forest.png",
	"MOUNTAIN": "res://assets/sprites/tiles/world_tile_mountain.png",
	"POND":     "res://assets/sprites/tiles/world_tile_pond.png",
}
@onready var tile_type_label: Label = $TileTypeLabel
@onready var tile_name_label: Label = $TileNameLabel
@onready var access_icon: ColorRect = $AccessIcon
@onready var vault_label: Label = $VaultLabel
@onready var enter_button: Button = $EnterButton
@onready var empty_label: Label = $EmptyLabel

var TYPE_COLORS: Dictionary = {}

var _tile_id: String = ""
var _npc_id: String = ""
var _is_empty: bool = true
var _is_owner: bool = false
var _select_overlay: ColorRect = null
var _drop_overlay: ColorRect = null
var _edit_btn: Button = null
var _move_btn: Button = null
var _drop_btn: Button = null
var _location_dot: Label = null
var _npc_standing_icon: TextureRect = null
var _access_label: Label = null
var _name_edit: LineEdit = null
var _name_confirm: Button = null

func _ready() -> void:
	# PASS (not the Control default STOP) so a click here still fires this
	# card's own buttons/logic but also keeps bubbling up to WorldMap's
	# _unhandled_input — otherwise these full-rect buttons blanket the
	# entire grid and no click-drag-to-pan gesture could ever reach it.
	mouse_filter = Control.MOUSE_FILTER_PASS
	enter_button.mouse_filter = Control.MOUSE_FILTER_PASS
	TYPE_COLORS = {
		"FARM":     Color(0.40, 0.70, 0.30),
		"FOREST":   Color(0.20, 0.50, 0.20),
		"MOUNTAIN": Color(0.50, 0.40, 0.30),
		"POND":     Color(0.20, 0.40, 0.70),
		"GUILD":    Color(0.60, 0.40, 0.80),
	}
	_select_overlay = ColorRect.new()
	_select_overlay.set_anchors_preset(Control.PRESET_FULL_RECT)
	_select_overlay.color = Color(1.0, 0.85, 0.0, 0.40)
	_select_overlay.mouse_filter = Control.MOUSE_FILTER_IGNORE
	_select_overlay.visible = false
	add_child(_select_overlay)

	_drop_overlay = ColorRect.new()
	_drop_overlay.set_anchors_preset(Control.PRESET_FULL_RECT)
	_drop_overlay.color = Color(0.0, 0.75, 0.4, 0.30)
	_drop_overlay.mouse_filter = Control.MOUSE_FILTER_IGNORE
	_drop_overlay.visible = false
	add_child(_drop_overlay)

	# Invisible full-rect button for reliable HTML5 click detection on drop targets
	_drop_btn = Button.new()
	_drop_btn.set_anchors_preset(Control.PRESET_FULL_RECT)
	_drop_btn.flat = true
	_drop_btn.modulate = Color(1, 1, 1, 0)
	_drop_btn.mouse_filter = Control.MOUSE_FILTER_PASS
	_drop_btn.visible = false
	_drop_btn.pressed.connect(func() -> void: drop_requested.emit(grid_position))
	add_child(_drop_btn)

	var _circle_sb := func() -> StyleBoxFlat:
		var sb := StyleBoxFlat.new()
		sb.bg_color = Color(0.0, 0.05, 0.15, 0.72)
		sb.border_color = Color(0.45, 0.75, 1.0)
		sb.set_border_width_all(1)
		sb.set_corner_radius_all(17)
		return sb

	_edit_btn = Button.new()
	_edit_btn.text = "Edit"
	_edit_btn.flat = false
	_edit_btn.add_theme_font_size_override("font_size", 8)
	_edit_btn.custom_minimum_size = Vector2(34, 34)
	_edit_btn.position = Vector2(size.x - 38, 2)
	_edit_btn.visible = false
	_edit_btn.mouse_filter = Control.MOUSE_FILTER_PASS
	_edit_btn.add_theme_stylebox_override("normal",  _circle_sb.call())
	_edit_btn.add_theme_stylebox_override("hover",   _circle_sb.call())
	_edit_btn.add_theme_stylebox_override("pressed", _circle_sb.call())
	_edit_btn.add_theme_color_override("font_color", Color(0.5, 0.85, 1.0))
	_edit_btn.add_theme_color_override("font_outline_color", Color(0, 0, 0, 0.8))
	_edit_btn.add_theme_constant_override("outline_size", 2)
	_edit_btn.pressed.connect(_on_edit_pressed)
	add_child(_edit_btn)

	_move_btn = Button.new()
	_move_btn.text = "Move"
	_move_btn.flat = false
	_move_btn.add_theme_font_size_override("font_size", 8)
	_move_btn.custom_minimum_size = Vector2(34, 34)
	_move_btn.position = Vector2(size.x - 38, 38)
	_move_btn.visible = false
	_move_btn.mouse_filter = Control.MOUSE_FILTER_PASS
	_move_btn.add_theme_stylebox_override("normal",  _circle_sb.call())
	_move_btn.add_theme_stylebox_override("hover",   _circle_sb.call())
	_move_btn.add_theme_stylebox_override("pressed", _circle_sb.call())
	_move_btn.add_theme_color_override("font_color", Color(0.5, 0.85, 1.0))
	_move_btn.add_theme_color_override("font_outline_color", Color(0, 0, 0, 0.8))
	_move_btn.add_theme_constant_override("outline_size", 2)
	_move_btn.pressed.connect(func() -> void:
		if _tile_id != "":
			drag_started.emit(_tile_id, grid_position)
	)
	add_child(_move_btn)

	# Access mode bubble (Public / Guild Only / Private)
	_access_label = Label.new()
	_access_label.add_theme_font_size_override("font_size", 7)
	_access_label.position = Vector2(2, 76)
	_access_label.size = Vector2(86, 14)
	_access_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	_access_label.mouse_filter = Control.MOUSE_FILTER_IGNORE
	_access_label.visible = false
	add_child(_access_label)

	# NPC "standing on the tile" overlay — a small character icon layered on
	# top of the hex terrain art, only shown for NPC cards (see set_npc_tile).
	_npc_standing_icon = TextureRect.new()
	_npc_standing_icon.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	_npc_standing_icon.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
	_npc_standing_icon.mouse_filter = Control.MOUSE_FILTER_IGNORE
	_npc_standing_icon.size = Vector2(44, 50)
	_npc_standing_icon.position = Vector2((90 - 44) / 2.0, 30)
	_npc_standing_icon.visible = false
	add_child(_npc_standing_icon)

	# Red dot shows on whichever tile the player is currently standing on
	_location_dot = Label.new()
	_location_dot.text = "●"
	_location_dot.modulate = Color(1.0, 0.15, 0.15, 0.85)
	_location_dot.add_theme_font_size_override("font_size", 40)
	_location_dot.position = Vector2(0, 0)
	_location_dot.size = Vector2(90, 90)
	_location_dot.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	_location_dot.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
	_location_dot.mouse_filter = Control.MOUSE_FILTER_IGNORE
	_location_dot.visible = false
	add_child(_location_dot)

	# Inline rename: LineEdit + confirm button, shown when owner clicks name label
	_name_edit = LineEdit.new()
	_name_edit.placeholder_text = "Enter name…"
	_name_edit.max_length = 24
	_name_edit.position = Vector2(4, 52)
	_name_edit.size     = Vector2(68, 18)
	_name_edit.add_theme_font_size_override("font_size", 8)
	_name_edit.visible = false
	_name_edit.text_submitted.connect(func(_s): _confirm_rename())
	_name_edit.gui_input.connect(func(ev: InputEvent) -> void:
		if ev is InputEventKey and ev.pressed and ev.keycode == KEY_ESCAPE:
			_hide_rename_edit())
	add_child(_name_edit)

	_name_confirm = Button.new()
	_name_confirm.text = "OK"
	_name_confirm.flat = true
	_name_confirm.custom_minimum_size = Vector2(16, 18)
	_name_confirm.position = Vector2(74, 52)
	_name_confirm.add_theme_font_size_override("font_size", 9)
	_name_confirm.visible = false
	_name_confirm.mouse_filter = Control.MOUSE_FILTER_STOP
	_name_confirm.pressed.connect(_confirm_rename)
	add_child(_name_confirm)

	# Make name label clickable so owners can tap it to rename
	tile_name_label.mouse_filter = Control.MOUSE_FILTER_STOP
	tile_name_label.gui_input.connect(_on_name_label_input)

	set_empty()

func set_empty() -> void:
	_tile_id = ""
	_npc_id = ""
	_is_empty = true
	_is_owner = false
	_hide_rename_edit()
	bg_image.visible = false
	bg_image.texture = null
	bg_rect.color = Color(0, 0, 0, 0)
	tile_type_label.text = ""
	tile_name_label.text = ""
	tile_name_label.modulate = Color(1, 1, 1)
	vault_label.text = ""
	empty_label.text = ""
	empty_label.visible = false
	enter_button.visible = false
	access_icon.visible = false
	if _edit_btn: _edit_btn.visible = false
	if _move_btn: _move_btn.visible = false
	if _location_dot: _location_dot.visible = false
	if _access_label: _access_label.visible = false
	if _npc_standing_icon: _npc_standing_icon.visible = false
	if _drop_btn: _drop_btn.visible = true   # always clickable on empty cells

func set_tile(tile_data: Dictionary) -> void:
	_tile_id = tile_data["id"]
	_npc_id = ""
	_is_empty = false
	_is_owner = tile_data.get("owner_id", "") == PlayerData.player_id
	_hide_rename_edit()
	if _npc_standing_icon: _npc_standing_icon.visible = false
	var type_str: String = tile_data.get("type_str", "FARM")
	var tex_path: String = TILE_TEXTURES.get(type_str, "")
	if tex_path != "" and ResourceLoader.exists(tex_path):
		bg_image.texture = load(tex_path) as Texture2D
		bg_image.stretch_mode = TextureRect.STRETCH_SCALE
		bg_image.visible = true
		bg_rect.color = Color(0, 0, 0, 0)
	else:
		bg_image.visible = false
		bg_rect.color = TYPE_COLORS.get(type_str, Color(0.3, 0.3, 0.3))
	tile_type_label.text = type_str.capitalize()
	var cur_name: String = tile_data.get("name", "")
	if _is_owner and cur_name == "":
		tile_name_label.text = "~ name this tile"
		tile_name_label.add_theme_color_override("font_color", Color(0.2, 0.4, 0.8))
	else:
		tile_name_label.text = cur_name
		tile_name_label.add_theme_color_override("font_color", Color(0.25, 0.55, 1.0))
	empty_label.text = ""
	empty_label.visible = false
	enter_button.visible = true
	access_icon.visible = true
	_update_access_icon(tile_data.get("access_mode", 0))
	_update_vault_label(tile_data.get("passive_vault", {}))
	if _edit_btn:
		_edit_btn.visible = _is_owner
		_edit_btn.position = Vector2(size.x - 38, 2)
	if _move_btn:
		_move_btn.visible = _is_owner
		_move_btn.position = Vector2(size.x - 38, 38)
	if _location_dot:
		_location_dot.visible = _tile_id != "" and _tile_id == LandManager.last_tile_id
	if _drop_btn: _drop_btn.visible = false  # not clickable on filled tiles

func set_npc_tile(npc_data: Dictionary) -> void:
	_npc_id = npc_data.get("id", "")
	_tile_id = ""
	_is_empty = false
	var col: Array = npc_data.get("color", [0.8, 0.7, 0.2])

	# Background: the same hex terrain art regular tiles use, matching the
	# NPC's theme (e.g. Frog Lilly's pond stall sits on a pond hex) — not
	# a colored box or the NPC's own portrait/spritesheet.
	var terrain: String = npc_data.get("terrain", "")
	var tex_path: String = TILE_TEXTURES.get(terrain, "")
	if tex_path != "" and ResourceLoader.exists(tex_path):
		bg_image.texture = load(tex_path) as Texture2D
		bg_image.stretch_mode = TextureRect.STRETCH_SCALE
		bg_image.visible = true
		bg_rect.color = Color(0, 0, 0, 0)
	else:
		bg_image.visible = false
		bg_image.texture = null
		bg_rect.color = Color(col[0], col[1], col[2])

	# NPC "standing" icon layered on top of the terrain, like a character
	# actually occupying the tile instead of a flat portrait filling it.
	var standing_path: String = npc_data.get("standing", "")
	if standing_path != "" and ResourceLoader.exists(standing_path):
		_npc_standing_icon.texture = load(standing_path) as Texture2D
		_npc_standing_icon.visible = true
	else:
		_npc_standing_icon.visible = false

	tile_type_label.text = "NPC"
	tile_name_label.text = npc_data.get("name", "")
	tile_name_label.add_theme_color_override("font_color", Color(0.25, 0.55, 1.0))
	vault_label.text = ""
	empty_label.text = ""
	empty_label.visible = false
	enter_button.visible = true
	access_icon.visible = false
	if _drop_btn: _drop_btn.visible = false

func set_selected(selected: bool) -> void:
	if _select_overlay:
		_select_overlay.visible = selected

func set_drop_target(is_target: bool) -> void:
	if _drop_overlay:
		_drop_overlay.visible = is_target
	# _drop_btn stays always-visible on empty cells; overlay handles visual feedback
	if _is_empty and empty_label:
		empty_label.text = "+" if is_target else ""
		empty_label.visible = is_target

func is_empty_cell() -> bool:
	return _is_empty

func is_npc_tile() -> bool:
	return _npc_id != ""

func set_deed_hint(show: bool) -> void:
	if not _is_empty:
		return
	if empty_label:
		empty_label.text = "+" if show else ""
		empty_label.visible = show
		empty_label.add_theme_font_size_override("font_size", 28)
		empty_label.modulate = Color(0.55, 0.85, 0.40, 0.70)

func _update_access_icon(mode: int) -> void:
	var label_text: String
	var label_color: Color
	if mode == LandManager.AccessMode.PUBLIC:
		access_icon.color = Color.GREEN
		label_text = "Public"
		label_color = Color(0.2, 1.0, 0.45)
	elif mode == LandManager.AccessMode.PRIVATE:
		access_icon.color = Color.RED
		label_text = "Private"
		label_color = Color(1.0, 0.35, 0.35)
	else:
		access_icon.color = Color.YELLOW
		label_text = "Guild Only"
		label_color = Color(1.0, 0.85, 0.2)
	if _access_label:
		_access_label.text = label_text
		_access_label.add_theme_color_override("font_color", label_color)
		_access_label.visible = true

func _update_vault_label(vault: Dictionary) -> void:
	if vault.is_empty():
		vault_label.text = ""
		return
	var total: int = 0
	for v in vault.values():
		total += int(v)
	vault_label.text = "Vault: %d" % total

func _on_edit_pressed() -> void:
	if _tile_id != "":
		edit_requested.emit(_tile_id)

func _on_enter_button_pressed() -> void:
	if _npc_id != "":
		npc_shop_requested.emit(_npc_id)
	elif _tile_id != "":
		enter_requested.emit(_tile_id)

func _on_name_label_input(event: InputEvent) -> void:
	if not _is_owner or _tile_id == "":
		return
	if event is InputEventMouseButton and event.pressed and event.button_index == MOUSE_BUTTON_LEFT:
		get_viewport().set_input_as_handled()
		_show_rename_edit()

func _show_rename_edit() -> void:
	if not _name_edit or not _name_confirm:
		return
	var current: String = tile_name_label.text
	if current == "~ name this tile":
		current = ""
	_name_edit.text = current
	tile_name_label.visible = false
	_name_edit.visible = true
	_name_confirm.visible = true
	_name_edit.grab_focus()
	_name_edit.select_all()

func _hide_rename_edit() -> void:
	if _name_edit:   _name_edit.visible = false
	if _name_confirm: _name_confirm.visible = false
	tile_name_label.visible = true

func _confirm_rename() -> void:
	if not _name_edit or _tile_id == "":
		_hide_rename_edit()
		return
	var new_name: String = _name_edit.text.strip_edges()
	if new_name != "":
		LandManager.set_tile_name(_tile_id, new_name)
	_hide_rename_edit()

