extends Node

var _username_input: LineEdit = null
var _password_input: LineEdit = null
var _confirm_input: LineEdit = null
var _status_lbl: Label = null
var _play_btn: Button = null
var _mode: String = "login"  # "login" or "register"
var _mode_lbl: Label = null
var _toggle_lbl: Label = null
var _toggle_btn: Button = null
var _confirm_row: Control = null

func _ready() -> void:
	# If a saved identity already loaded, go straight to the game
	if PlayerData.has_identity():
		get_tree().change_scene_to_file("res://scenes/world_map/WorldMap.tscn")
		return
	_build_ui()

func _build_ui() -> void:
	var bg := ColorRect.new()
	bg.set_anchors_preset(Control.PRESET_FULL_RECT)
	bg.color = Color(0.08, 0.13, 0.07)
	bg.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(bg)

	var center := Control.new()
	center.set_anchors_preset(Control.PRESET_FULL_RECT)
	center.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(center)

	var panel := PanelContainer.new()
	panel.custom_minimum_size = Vector2(340, 0)
	panel.anchor_left   = 0.5
	panel.anchor_top    = 0.5
	panel.anchor_right  = 0.5
	panel.anchor_bottom = 0.5
	panel.grow_horizontal = Control.GROW_DIRECTION_BOTH
	panel.grow_vertical   = Control.GROW_DIRECTION_BOTH
	center.add_child(panel)

	var vbox := VBoxContainer.new()
	vbox.add_theme_constant_override("separation", 14)
	panel.add_child(vbox)

	var pad := MarginContainer.new()
	for side in ["left","right","top","bottom"]:
		pad.add_theme_constant_override("margin_" + side, 24)
	vbox.add_child(pad)

	var inner := VBoxContainer.new()
	inner.add_theme_constant_override("separation", 12)
	pad.add_child(inner)

	# Title
	var title := Label.new()
	title.text = "FOXSTEAD"
	title.add_theme_font_size_override("font_size", 26)
	title.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	title.modulate = Color(0.55, 0.85, 0.35)
	inner.add_child(title)

	var sub := Label.new()
	sub.text = "Entirely inspired by the game Nomstead and the Nomstead team!"
	sub.add_theme_font_size_override("font_size", 10)
	sub.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	sub.autowrap_mode = TextServer.AUTOWRAP_WORD
	sub.custom_minimum_size = Vector2(290, 0)
	sub.modulate = Color(0.65, 0.65, 0.65)
	inner.add_child(sub)

	inner.add_child(HSeparator.new())

	# Mode label
	_mode_lbl = Label.new()
	_mode_lbl.add_theme_font_size_override("font_size", 13)
	_mode_lbl.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	inner.add_child(_mode_lbl)

	# Username
	var u_lbl := Label.new()
	u_lbl.text = "Farmer Name"
	u_lbl.add_theme_font_size_override("font_size", 11)
	inner.add_child(u_lbl)

	_username_input = LineEdit.new()
	_username_input.placeholder_text = "Enter your name…"
	_username_input.max_length = 20
	_username_input.custom_minimum_size = Vector2(290, 36)
	_username_input.text_submitted.connect(func(_s): _on_play())
	inner.add_child(_username_input)

	# Password
	var p_lbl := Label.new()
	p_lbl.text = "Password"
	p_lbl.add_theme_font_size_override("font_size", 11)
	inner.add_child(p_lbl)

	var p_row := HBoxContainer.new()
	p_row.add_theme_constant_override("separation", 4)
	inner.add_child(p_row)
	_password_input = LineEdit.new()
	_password_input.placeholder_text = "Password…"
	_password_input.secret = true
	_password_input.max_length = 40
	_password_input.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	_password_input.custom_minimum_size = Vector2(0, 36)
	_password_input.text_submitted.connect(func(_s): _on_play())
	p_row.add_child(_password_input)
	p_row.add_child(_make_eye_btn(_password_input))

	# Confirm password (register only)
	_confirm_row = VBoxContainer.new()
	_confirm_row.add_theme_constant_override("separation", 4)
	var c_lbl := Label.new()
	c_lbl.text = "Confirm Password"
	c_lbl.add_theme_font_size_override("font_size", 11)
	_confirm_row.add_child(c_lbl)
	var c_row := HBoxContainer.new()
	c_row.add_theme_constant_override("separation", 4)
	_confirm_row.add_child(c_row)
	_confirm_input = LineEdit.new()
	_confirm_input.placeholder_text = "Repeat password…"
	_confirm_input.secret = true
	_confirm_input.max_length = 40
	_confirm_input.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	_confirm_input.custom_minimum_size = Vector2(0, 36)
	_confirm_input.text_submitted.connect(func(_s): _on_play())
	c_row.add_child(_confirm_input)
	c_row.add_child(_make_eye_btn(_confirm_input))
	_confirm_row.visible = false
	inner.add_child(_confirm_row)

	# Status label
	_status_lbl = Label.new()
	_status_lbl.add_theme_font_size_override("font_size", 10)
	_status_lbl.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	_status_lbl.autowrap_mode = TextServer.AUTOWRAP_WORD
	_status_lbl.custom_minimum_size = Vector2(290, 0)
	_status_lbl.text = ""
	inner.add_child(_status_lbl)

	# Play button
	_play_btn = Button.new()
	_play_btn.custom_minimum_size = Vector2(290, 42)
	_play_btn.add_theme_font_size_override("font_size", 14)
	_play_btn.pressed.connect(_on_play)
	inner.add_child(_play_btn)
	_style_play_btn()

	# Toggle register/login
	var toggle_row := HBoxContainer.new()
	toggle_row.alignment = BoxContainer.ALIGNMENT_CENTER
	toggle_row.add_theme_constant_override("separation", 4)
	inner.add_child(toggle_row)

	_toggle_lbl = Label.new()
	_toggle_lbl.add_theme_font_size_override("font_size", 10)
	_toggle_lbl.modulate = Color(0.7, 0.7, 0.7)
	toggle_row.add_child(_toggle_lbl)

	_toggle_btn = Button.new()
	_toggle_btn.flat = true
	_toggle_btn.add_theme_font_size_override("font_size", 10)
	_toggle_btn.add_theme_color_override("font_color", Color(0.4, 0.85, 0.55))
	_toggle_btn.pressed.connect(_toggle_mode)
	toggle_row.add_child(_toggle_btn)

	_set_mode("login")

	# Position panel centre after layout
	await get_tree().process_frame
	panel.position = Vector2(
		(get_viewport().get_visible_rect().size.x - panel.size.x) / 2.0,
		(get_viewport().get_visible_rect().size.y - panel.size.y) / 2.0
	)

func _set_mode(mode: String) -> void:
	_mode = mode
	_status_lbl.text = ""
	if mode == "login":
		_mode_lbl.text = "Sign In"
		_play_btn.text  = "Play"
		_confirm_row.visible = false
		_toggle_lbl.text = "No account yet?"
		_toggle_btn.text = "Create one"
	else:
		_mode_lbl.text = "Create Account"
		_play_btn.text  = "Create & Play"
		_confirm_row.visible = true
		_toggle_lbl.text = "Already have one?"
		_toggle_btn.text = "Sign in"

func _toggle_mode() -> void:
	_set_mode("register" if _mode == "login" else "login")

func _on_play() -> void:
	var name_raw: String = _username_input.text.strip_edges()
	var pass_raw: String = _password_input.text

	if name_raw.length() < 2:
		_show_error("Name must be at least 2 characters.")
		return
	if pass_raw.length() < 4:
		_show_error("Password must be at least 4 characters.")
		return

	if _mode == "register":
		var confirm: String = _confirm_input.text
		if pass_raw != confirm:
			_show_error("Passwords do not match.")
			return
		if _account_exists(name_raw):
			_show_error("That name is taken. Sign in instead.")
			return
		PlayerData.set_username(name_raw, pass_raw)
		get_tree().change_scene_to_file("res://scenes/world_map/WorldMap.tscn")
	else:
		if not _account_exists(name_raw):
			_show_error("No account found. Create one first.")
			return
		if not PlayerData.check_password(name_raw, pass_raw):
			_show_error("Wrong password.")
			return
		PlayerData.set_username(name_raw, pass_raw)
		get_tree().change_scene_to_file("res://scenes/world_map/WorldMap.tscn")

func _account_exists(name_raw: String) -> bool:
	var cfg := ConfigFile.new()
	if cfg.load(PlayerData.IDENTITY_PATH) != OK:
		return false
	var accounts: Dictionary = cfg.get_value("accounts", "data", {})
	return accounts.has(name_raw.to_lower())

func _show_error(msg: String) -> void:
	_status_lbl.text = msg
	_status_lbl.modulate = Color(1.0, 0.4, 0.4)

func _make_eye_btn(field: LineEdit) -> Button:
	var btn := Button.new()
	btn.text = "show"
	btn.flat = true
	btn.add_theme_font_size_override("font_size", 9)
	btn.custom_minimum_size = Vector2(40, 36)
	btn.toggle_mode = true
	btn.toggled.connect(func(on: bool) -> void:
		field.secret = not on
	)
	return btn

func _style_play_btn() -> void:
	for sd in [
		["normal",   Color(0.18, 0.42, 0.14), Color(0.30, 0.62, 0.22)],
		["hover",    Color(0.24, 0.52, 0.18), Color(0.40, 0.75, 0.28)],
		["pressed",  Color(0.12, 0.30, 0.10), Color(0.22, 0.48, 0.16)],
		["disabled", Color(0.15, 0.18, 0.14), Color(0.25, 0.28, 0.24)],
	]:
		var s := StyleBoxFlat.new()
		s.corner_radius_top_left     = 20
		s.corner_radius_top_right    = 20
		s.corner_radius_bottom_left  = 20
		s.corner_radius_bottom_right = 20
		s.border_width_left   = 2
		s.border_width_right  = 2
		s.border_width_top    = 2
		s.border_width_bottom = 2
		s.bg_color     = sd[1]
		s.border_color = sd[2]
		_play_btn.add_theme_stylebox_override(sd[0], s)
	_play_btn.add_theme_color_override("font_color", Color.WHITE)
