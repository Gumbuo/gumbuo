extends CanvasLayer

const COLLECT_SECS := 86400  # 24 hours

var _tile_id:  String  = ""
var _grid_pos: Vector2i = Vector2i.ZERO
var _slot_key: String  = ""

func _ready() -> void:
	layer = 40

func setup(t_id: String, g_pos: Vector2i) -> void:
	_tile_id  = t_id
	_grid_pos = g_pos
	_slot_key = LandManager.slot_key(_grid_pos)
	_build_ui()

# ── UI ────────────────────────────────────────────────────────
func _build_ui() -> void:
	var overlay := ColorRect.new()
	overlay.set_anchors_preset(Control.PRESET_FULL_RECT)
	overlay.color = Color(0, 0, 0, 0.65)
	overlay.mouse_filter = Control.MOUSE_FILTER_STOP
	add_child(overlay)

	var panel := PanelContainer.new()
	panel.set_anchors_preset(Control.PRESET_CENTER)
	panel.offset_left = -160; panel.offset_top  = -130
	panel.offset_right =  160; panel.offset_bottom = 130
	panel.mouse_filter = Control.MOUSE_FILTER_STOP
	var sty := StyleBoxFlat.new()
	sty.bg_color = Color(0.12, 0.09, 0.02, 0.97)
	sty.border_color = Color(0.92, 0.75, 0.10)
	sty.set_border_width_all(2)
	sty.set_corner_radius_all(8)
	sty.set_content_margin_all(12)
	panel.add_theme_stylebox_override("panel", sty)
	overlay.add_child(panel)

	var root := VBoxContainer.new()
	root.add_theme_constant_override("separation", 10)
	panel.add_child(root)

	# Title row
	var hdr := HBoxContainer.new()
	root.add_child(hdr)
	var title := Label.new()
	title.text = "Beehive"
	title.add_theme_font_size_override("font_size", 14)
	title.modulate = Color(0.95, 0.80, 0.15)
	title.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	hdr.add_child(title)
	var x_btn := Button.new()
	x_btn.text = " X "
	x_btn.pressed.connect(func(): queue_free())
	hdr.add_child(x_btn)

	root.add_child(HSeparator.new())

	# Status label (updated in _refresh_status)
	var status_lbl := Label.new()
	status_lbl.name = "StatusLbl"
	status_lbl.add_theme_font_size_override("font_size", 11)
	status_lbl.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	root.add_child(status_lbl)

	# Yield row
	var yield_hb := HBoxContainer.new()
	yield_hb.alignment = BoxContainer.ALIGNMENT_CENTER
	yield_hb.add_theme_constant_override("separation", 16)
	root.add_child(yield_hb)
	_add_yield_item(yield_hb, "Honey", "x 2")
	_add_yield_item(yield_hb, "Beeswax", "x 1")

	root.add_child(HSeparator.new())

	# Collect button
	var collect_btn := Button.new()
	collect_btn.name = "CollectBtn"
	collect_btn.text = "Collect"
	collect_btn.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	collect_btn.pressed.connect(_on_collect_pressed)
	root.add_child(collect_btn)

	_refresh_status()

func _add_yield_item(parent: HBoxContainer, item_name: String, qty: String) -> void:
	var vb := VBoxContainer.new()
	vb.add_theme_constant_override("separation", 2)
	parent.add_child(vb)
	var name_lbl := Label.new()
	name_lbl.text = item_name
	name_lbl.add_theme_font_size_override("font_size", 10)
	name_lbl.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	vb.add_child(name_lbl)
	var qty_lbl := Label.new()
	qty_lbl.text = qty
	qty_lbl.add_theme_font_size_override("font_size", 12)
	qty_lbl.modulate = Color(0.95, 0.80, 0.15)
	qty_lbl.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	vb.add_child(qty_lbl)

# ── State ─────────────────────────────────────────────────────
func _get_slot_data() -> Dictionary:
	return LandManager.tiles.get(_tile_id, {}).get("slots", {}).get(_slot_key, {})

func _is_ready() -> bool:
	var last: int = _get_slot_data().get("last_collected", 0)
	return last == 0 or (int(Time.get_unix_time_from_system()) - last) >= COLLECT_SECS

func _refresh_status() -> void:
	var status_lbl: Label = get_node_or_null("*/StatusLbl")
	if status_lbl == null:
		for child in get_children():
			status_lbl = _find_named(child, "StatusLbl")
			if status_lbl: break
	var collect_btn: Button = null
	for child in get_children():
		collect_btn = _find_named(child, "CollectBtn")
		if collect_btn: break

	if _is_ready():
		if status_lbl:
			status_lbl.text = "Ready to collect!"
			status_lbl.modulate = Color(0.35, 1.0, 0.4)
		if collect_btn: collect_btn.disabled = false
	else:
		var last: int = _get_slot_data().get("last_collected", 0)
		var remaining: int = COLLECT_SECS - (int(Time.get_unix_time_from_system()) - last)
		var hrs: int  = remaining / 3600
		var mins: int = (remaining % 3600) / 60
		if status_lbl:
			status_lbl.text = "Next collection in %dh %dm" % [hrs, mins]
			status_lbl.modulate = Color(0.75, 0.75, 0.75)
		if collect_btn: collect_btn.disabled = true

func _find_named(node: Node, n: String) -> Node:
	if node.name == n: return node
	for c in node.get_children():
		var found := _find_named(c, n)
		if found: return found
	return null

# ── Collect ───────────────────────────────────────────────────
func _on_collect_pressed() -> void:
	if not _is_ready(): return

	ResourceManager.add_item("honey", 2)
	ResourceManager.add_item("beeswax", 1)
	PlayerData.add_xp(2)

	var slots: Dictionary = LandManager.tiles.get(_tile_id, {}).get("slots", {})
	var data: Dictionary  = slots.get(_slot_key, {})
	data["last_collected"] = int(Time.get_unix_time_from_system())
	LandManager.slot_item_placed.emit(_tile_id, _slot_key, "beehive")
	LandManager.save_land_data()

	queue_free()
