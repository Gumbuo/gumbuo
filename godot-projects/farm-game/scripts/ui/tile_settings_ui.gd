extends CanvasLayer

var _tile_id: String = ""
var _name_input: LineEdit = null
var _access_btns: Array = []   # [public_btn, guild_btn, private_btn]

func open(tile_id: String) -> void:
	_tile_id = tile_id
	var tile: Dictionary = LandManager.tiles.get(tile_id, {})
	if tile.is_empty():
		queue_free()
		return
	_name_input.text = tile.get("name", "")
	_set_active_access(tile.get("access_mode", LandManager.AccessMode.PUBLIC))

func _ready() -> void:
	_build_ui()

func _build_ui() -> void:
	# dim overlay — click to close
	var overlay := ColorRect.new()
	overlay.set_anchors_preset(Control.PRESET_FULL_RECT)
	overlay.color = Color(0, 0, 0, 0.55)
	overlay.mouse_filter = Control.MOUSE_FILTER_STOP
	overlay.gui_input.connect(_on_overlay_input)
	add_child(overlay)

	# panel
	var panel := PanelContainer.new()
	panel.custom_minimum_size = Vector2(320, 0)
	panel.anchor_left   = 0.5
	panel.anchor_top    = 0.5
	panel.anchor_right  = 0.5
	panel.anchor_bottom = 0.5
	panel.grow_horizontal = Control.GROW_DIRECTION_BOTH
	panel.grow_vertical   = Control.GROW_DIRECTION_BOTH
	add_child(panel)

	var vbox := VBoxContainer.new()
	vbox.add_theme_constant_override("separation", 14)
	panel.add_child(vbox)

	# padding wrapper
	var pad := MarginContainer.new()
	for side in ["left","right","top","bottom"]:
		pad.add_theme_constant_override("margin_" + side, 18)
	vbox.add_child(pad)
	var inner := VBoxContainer.new()
	inner.add_theme_constant_override("separation", 14)
	pad.add_child(inner)

	# title
	var title := Label.new()
	title.text = "Tile Settings"
	title.add_theme_font_size_override("font_size", 14)
	inner.add_child(title)

	# ── Name row ──
	var name_lbl := Label.new()
	name_lbl.text = "Tile Name"
	name_lbl.add_theme_font_size_override("font_size", 11)
	inner.add_child(name_lbl)

	_name_input = LineEdit.new()
	_name_input.placeholder_text = "Enter a name…"
	_name_input.custom_minimum_size = Vector2(280, 32)
	_name_input.max_length = 32
	inner.add_child(_name_input)

	# ── Access row ──
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
		var btn := Button.new()
		btn.text = m[0]
		btn.custom_minimum_size = Vector2(84, 30)
		btn.add_theme_font_size_override("font_size", 10)
		btn.meta_set("mode", m[1])
		btn.meta_set("active_color", m[2])
		btn.pressed.connect(_on_access_btn.bind(btn))
		access_row.add_child(btn)
		_access_btns.append(btn)

	# ── Save / Cancel ──
	var btn_row := HBoxContainer.new()
	btn_row.alignment = BoxContainer.ALIGNMENT_END
	btn_row.add_theme_constant_override("separation", 8)
	inner.add_child(btn_row)

	var cancel_btn := Button.new()
	cancel_btn.text = "Cancel"
	cancel_btn.pressed.connect(queue_free)
	btn_row.add_child(cancel_btn)

	var save_btn := Button.new()
	save_btn.text = "Save"
	save_btn.pressed.connect(_on_save)
	btn_row.add_child(save_btn)

	# position panel after layout
	await get_tree().process_frame
	panel.position = Vector2(
		(get_viewport().get_visible_rect().size.x - panel.size.x) / 2.0,
		(get_viewport().get_visible_rect().size.y - panel.size.y) / 2.0
	)

func _set_active_access(mode: int) -> void:
	for btn in _access_btns:
		var is_active: bool = int(btn.meta_get("mode")) == mode
		if is_active:
			btn.modulate = btn.meta_get("active_color")
			btn.add_theme_color_override("font_color", Color.WHITE)
		else:
			btn.modulate = Color.WHITE
			btn.remove_theme_color_override("font_color")

func _on_access_btn(btn: Button) -> void:
	_set_active_access(int(btn.meta_get("mode")))

func _on_save() -> void:
	var new_name: String = _name_input.text.strip_edges()
	if new_name != "":
		LandManager.set_tile_name(_tile_id, new_name)
	# find which access button is "active" (has color modulate set)
	for btn in _access_btns:
		if btn.modulate != Color.WHITE:
			LandManager.set_tile_access(_tile_id, btn.meta_get("mode") as LandManager.AccessMode)
			break
	queue_free()

func _on_overlay_input(event: InputEvent) -> void:
	if event is InputEventMouseButton and event.pressed:
		queue_free()
