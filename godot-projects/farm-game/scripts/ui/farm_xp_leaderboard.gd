extends CanvasLayer

const API_URL   := "https://gamehole.ink/api/farm-xp"
const MAX_ROWS  := 20

var _req:     HTTPRequest    = null
var _list_vb: VBoxContainer  = null

func _ready() -> void:
	layer = 35
	_req = HTTPRequest.new()
	add_child(_req)
	_req.request_completed.connect(_on_response)
	_build_ui()
	_req.request(API_URL, ["Accept: application/json"])

# ── UI ────────────────────────────────────────────────────────
func _build_ui() -> void:
	var overlay := ColorRect.new()
	overlay.set_anchors_preset(Control.PRESET_FULL_RECT)
	overlay.color = Color(0, 0, 0, 0.72)
	overlay.mouse_filter = Control.MOUSE_FILTER_STOP
	overlay.gui_input.connect(func(ev: InputEvent) -> void:
		if ev is InputEventMouseButton and ev.pressed: queue_free()
	)
	add_child(overlay)

	var panel := PanelContainer.new()
	panel.set_anchors_preset(Control.PRESET_CENTER)
	panel.offset_left = -290; panel.offset_top  = -230
	panel.offset_right =  290; panel.offset_bottom = 230
	panel.mouse_filter = Control.MOUSE_FILTER_STOP
	var sty := StyleBoxFlat.new()
	sty.bg_color = Color(0.10, 0.10, 0.14, 0.97)
	sty.border_color = Color(0.9, 0.75, 0.2)
	sty.set_border_width_all(2)
	sty.set_corner_radius_all(8)
	sty.set_content_margin_all(10)
	panel.add_theme_stylebox_override("panel", sty)
	overlay.add_child(panel)

	var root := VBoxContainer.new()
	root.add_theme_constant_override("separation", 6)
	panel.add_child(root)

	# Header row
	var hdr := HBoxContainer.new()
	root.add_child(hdr)
	var title := Label.new()
	title.text = "  XP LEADERBOARD"
	title.add_theme_font_size_override("font_size", 14)
	title.modulate = Color(1.0, 0.85, 0.3)
	title.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	hdr.add_child(title)
	var x_btn := Button.new()
	x_btn.text = " X "
	x_btn.pressed.connect(func(): queue_free())
	hdr.add_child(x_btn)

	root.add_child(HSeparator.new())

	# Column labels
	root.add_child(_make_row("#", "Player", "Lv", "XP", true))
	root.add_child(HSeparator.new())

	var scroll := ScrollContainer.new()
	scroll.size_flags_vertical = Control.SIZE_EXPAND_FILL
	root.add_child(scroll)

	_list_vb = VBoxContainer.new()
	_list_vb.add_theme_constant_override("separation", 1)
	_list_vb.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	scroll.add_child(_list_vb)

	var loading := Label.new()
	loading.name = "LoadingLbl"
	loading.text = "  Loading..."
	loading.add_theme_font_size_override("font_size", 10)
	loading.modulate = Color(0.65, 0.65, 0.65)
	_list_vb.add_child(loading)

func _make_row(rank: String, name: String, level: String, xp: String, header: bool) -> HBoxContainer:
	var row := HBoxContainer.new()
	row.add_theme_constant_override("separation", 6)

	var sizes := [32, 0, 42, 72]  # rank, name(expand), level, xp
	var texts  := [rank, name, level, xp]
	for i in 4:
		var lbl := Label.new()
		lbl.text = texts[i]
		lbl.add_theme_font_size_override("font_size", 9 if header else 10)
		if i == 1:
			lbl.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		else:
			lbl.custom_minimum_size = Vector2(sizes[i], 0)
		if header:
			lbl.modulate = Color(0.55, 0.65, 0.85)
		row.add_child(lbl)

	return row

# ── Network ──────────────────────────────────────────────────
func _on_response(_res: int, code: int, _hdrs: PackedStringArray, body: PackedByteArray) -> void:
	var loading: Label = _list_vb.get_node_or_null("LoadingLbl")
	if loading: loading.queue_free()

	if code != 200:
		_add_error("Could not reach leaderboard server.")
		return

	var json := JSON.new()
	if json.parse(body.get_string_from_utf8()) != OK:
		_add_error("Invalid response from server.")
		return
	var data = json.get_data()
	if not data is Dictionary:
		_add_error("Unexpected response format.")
		return

	var lb: Array = data.get("leaderboard", [])
	var my_wallet: String = PlayerData.wallet_address.to_lower()

	if lb.is_empty():
		var none := Label.new()
		none.text = "  No entries yet — play to be the first!"
		none.add_theme_font_size_override("font_size", 10)
		none.modulate = Color(0.6, 0.6, 0.6)
		_list_vb.add_child(none)
		return

	for i in min(lb.size(), MAX_ROWS):
		var entry: Dictionary = lb[i]
		var wallet: String = entry.get("wallet", "")
		var dname:  String = entry.get("name",   _short_addr(wallet))
		var lvl:    int    = entry.get("level",  1)
		var xp:     int    = entry.get("xp",     0)
		var rank:   int    = entry.get("rank",   i + 1)
		var is_me:  bool   = wallet.to_lower() == my_wallet

		var row := _make_row("#%d" % rank, dname, "Lv.%d" % lvl, "%d XP" % xp, false)
		if is_me:
			for child in row.get_children():
				if child is Label:
					(child as Label).modulate = Color(0.35, 1.0, 0.5)
		_list_vb.add_child(row)

func _add_error(msg: String) -> void:
	var lbl := Label.new()
	lbl.text = "  " + msg
	lbl.add_theme_font_size_override("font_size", 10)
	lbl.modulate = Color(1.0, 0.4, 0.4)
	_list_vb.add_child(lbl)

func _short_addr(w: String) -> String:
	if w.length() < 10: return w
	return w.substr(0, 6) + "..." + w.substr(w.length() - 4)
