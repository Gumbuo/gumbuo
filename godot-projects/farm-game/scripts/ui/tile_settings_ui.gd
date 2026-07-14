extends CanvasLayer

var _tile_id: String = ""
var _name_input: LineEdit = null
var _access_btns: Array = []
var _selected_access_mode: int = 0

func open(tile_id: String) -> void:
	_tile_id = tile_id
	var tile: Dictionary = LandManager.tiles.get(tile_id, {})
	if tile.is_empty():
		queue_free()
		return
	_name_input.text = tile.get("name", "")
	_set_active_access(tile.get("access_mode", LandManager.AccessMode.PUBLIC))

func _ready() -> void:
	add_to_group("action_windows")
	_build_ui()

func _build_ui() -> void:
	# Root control fills the full CanvasLayer — catches all clicks so world map can't see them
	var root := Control.new()
	root.set_anchors_preset(Control.PRESET_FULL_RECT)
	root.mouse_filter = Control.MOUSE_FILTER_STOP
	add_child(root)

	# Dim overlay — clicking it closes the panel
	var overlay := ColorRect.new()
	overlay.set_anchors_preset(Control.PRESET_FULL_RECT)
	overlay.color = Color(0, 0, 0, 0.55)
	overlay.mouse_filter = Control.MOUSE_FILTER_STOP
	overlay.gui_input.connect(_on_overlay_input)
	root.add_child(overlay)

	# Panel — added after overlay so it receives input first (later children win)
	var panel := PanelContainer.new()
	panel.set_anchors_preset(Control.PRESET_CENTER)
	panel.offset_left   = -160
	panel.offset_right  = 160
	panel.offset_top    = -155
	panel.offset_bottom = 155
	panel.mouse_filter = Control.MOUSE_FILTER_STOP
	root.add_child(panel)

	var vbox := VBoxContainer.new()
	vbox.add_theme_constant_override("separation", 14)
	panel.add_child(vbox)

	var pad := MarginContainer.new()
	for side in ["left", "right", "top", "bottom"]:
		pad.add_theme_constant_override("margin_" + side, 18)
	vbox.add_child(pad)
	var inner := VBoxContainer.new()
	inner.add_theme_constant_override("separation", 14)
	pad.add_child(inner)

	var title := Label.new()
	title.text = "Tile Settings"
	title.add_theme_font_size_override("font_size", 14)
	inner.add_child(title)

	var name_lbl := Label.new()
	name_lbl.text = "Tile Name"
	name_lbl.add_theme_font_size_override("font_size", 11)
	inner.add_child(name_lbl)

	_name_input = LineEdit.new()
	_name_input.placeholder_text = "Enter a name…"
	_name_input.custom_minimum_size = Vector2(280, 32)
	_name_input.max_length = 32
	inner.add_child(_name_input)

	var access_lbl := Label.new()
	access_lbl.text = "Who can enter?"
	access_lbl.add_theme_font_size_override("font_size", 11)
	inner.add_child(access_lbl)

	var access_row := HBoxContainer.new()
	access_row.add_theme_constant_override("separation", 8)
	inner.add_child(access_row)

	var modes: Array = [
		["Public",     LandManager.AccessMode.PUBLIC,     Color(0.2, 0.8, 0.4)],
		["Guild Only", LandManager.AccessMode.GUILD_ONLY, Color(0.8, 0.7, 0.2)],
		["Private",    LandManager.AccessMode.PRIVATE,    Color(0.9, 0.3, 0.3)],
	]

	_access_btns.clear()

	for m in modes:
		var mode_val: int = m[1]
		var btn := Button.new()
		btn.text = m[0]
		btn.custom_minimum_size = Vector2(84, 34)
		btn.add_theme_font_size_override("font_size", 10)
		btn.mouse_filter = Control.MOUSE_FILTER_STOP
		btn.meta_set("mode", mode_val)
		btn.meta_set("active_color", m[2])
		btn.pressed.connect(func() -> void: _set_active_access(mode_val))
		access_row.add_child(btn)
		_access_btns.append(btn)

	var btn_row := HBoxContainer.new()
	btn_row.alignment = BoxContainer.ALIGNMENT_END
	btn_row.add_theme_constant_override("separation", 8)
	inner.add_child(btn_row)

	var delete_btn := Button.new()
	delete_btn.text = "Delete Tile"
	delete_btn.add_theme_font_size_override("font_size", 10)
	delete_btn.add_theme_color_override("font_color", Color(1.0, 0.4, 0.4))
	delete_btn.mouse_filter = Control.MOUSE_FILTER_STOP
	delete_btn.pressed.connect(_on_delete)
	btn_row.add_child(delete_btn)

	var cancel_btn := Button.new()
	cancel_btn.text = "Cancel"
	cancel_btn.mouse_filter = Control.MOUSE_FILTER_STOP
	cancel_btn.pressed.connect(queue_free)
	btn_row.add_child(cancel_btn)

	var save_btn := Button.new()
	save_btn.text = "Save"
	save_btn.mouse_filter = Control.MOUSE_FILTER_STOP
	save_btn.pressed.connect(_on_save)
	btn_row.add_child(save_btn)

func _set_active_access(mode: int) -> void:
	_selected_access_mode = mode
	for btn in _access_btns:
		var is_active: bool = int(btn.meta_get("mode")) == mode
		var active_col: Color = btn.meta_get("active_color")
		if btn.button_pressed != is_active:
			btn.set_pressed_no_signal(is_active)
		var states: Array = [
			["normal",  0.0],
			["hover",   0.12],
			["pressed", -0.15],
			["focus",   0.0],
		]
		for sd in states:
			var s := StyleBoxFlat.new()
			s.corner_radius_top_left     = 6
			s.corner_radius_top_right    = 6
			s.corner_radius_bottom_left  = 6
			s.corner_radius_bottom_right = 6
			s.border_width_left   = 1
			s.border_width_right  = 1
			s.border_width_top    = 1
			s.border_width_bottom = 1
			if is_active:
				var c: Color = active_col.lightened(sd[1]) if sd[1] > 0 else active_col.darkened(absf(sd[1]))
				s.bg_color     = c
				s.border_color = active_col.darkened(0.25)
			else:
				var base := Color(0.88, 0.88, 0.90)
				var c: Color = base.lightened(sd[1]) if sd[1] > 0 else base.darkened(absf(sd[1]))
				s.bg_color     = c
				s.border_color = Color(0.60, 0.60, 0.64)
			btn.add_theme_stylebox_override(sd[0], s)
		if is_active:
			btn.add_theme_color_override("font_color", Color.WHITE)
		else:
			btn.add_theme_color_override("font_color", Color(0.12, 0.12, 0.14))

func _on_save() -> void:
	var new_name: String = _name_input.text.strip_edges()
	if new_name != "":
		LandManager.set_tile_name(_tile_id, new_name)
	LandManager.set_tile_access(_tile_id, _selected_access_mode as LandManager.AccessMode)
	queue_free()

func _on_delete() -> void:
	LandManager.remove_tile(_tile_id)
	queue_free()

func _on_overlay_input(event: InputEvent) -> void:
	if event is InputEventMouseButton and event.pressed:
		queue_free()
