extends CanvasLayer

const CELL_SIZE := 72.0
const CELL_GAP  := 7.0
const COLS      := 7

const CATEGORIES := ["All", "Seeds", "Materials", "Crops", "Food", "Tools", "Placeables", "Decor", "Recipes"]
const CAT_KEYS   := ["",    "seeds", "materials", "crops", "food", "tools", "placeables",  "decor", "recipes"]

# ── Palette (mirrors ui.css custom properties) ──────────────────────────
const C_BG         := Color(0.071, 0.063, 0.047, 0.95)
const C_BORDER     := Color(1.000, 0.863, 0.471, 0.20)
const C_HEADER_BG  := Color(0.000, 0.000, 0.000, 0.50)
const C_ACCENT     := Color(0.784, 0.659, 0.294)
const C_ACCENT_DIM := Color(0.478, 0.384, 0.157)
const C_TEXT       := Color(0.910, 0.875, 0.753)
const C_TEXT_DIM   := Color(0.478, 0.439, 0.376)
const C_TAB_BG     := Color(1.000, 1.000, 1.000, 0.04)
const C_TAB_ACTIVE := Color(0.784, 0.659, 0.294, 0.20)
const C_ITEM_BG    := Color(1.000, 1.000, 1.000, 0.05)
const C_ITEM_BORD  := Color(1.000, 1.000, 1.000, 0.08)
const C_SEP        := Color(1.000, 1.000, 1.000, 0.06)

var _active_cat: int = 0
var _cell_nodes: Array = []
var _content_box: VBoxContainer = null
var _silver_lbl: Label = null
var _cat_btns: Array = []
var _consume_bar: Control = null
var _consume_lbl: Label = null
var _consume_btn: Button = null
var _selected_food: String = ""
var _selected_food_info: Dictionary = {}

func _ready() -> void:
	add_to_group("action_windows")
	_build_ui()

func refresh() -> void:
	_rebuild_items()

# ── Build ────────────────────────────────────────────────────────────────

func _build_ui() -> void:
	var pw := 620.0
	var ph := 430.0

	# Root panel — dark background + gold border
	var root := Control.new()
	root.position = Vector2((1280.0 - pw) / 2.0, 30.0)
	root.size     = Vector2(pw, ph)
	add_child(root)

	var bg := ColorRect.new()
	bg.set_anchors_preset(Control.PRESET_FULL_RECT)
	bg.color = C_BG
	root.add_child(bg)

	var border := _make_border_rect(pw, ph)
	root.add_child(border)

	# Rounded corner trick: inner fill masks the corner pixels of the border
	var inner := ColorRect.new()
	inner.position = Vector2(1, 1)
	inner.size     = Vector2(pw - 2, ph - 2)
	inner.color    = C_BG
	root.add_child(inner)

	# Main layout inside
	var vbox := VBoxContainer.new()
	vbox.set_anchors_preset(Control.PRESET_FULL_RECT)
	vbox.add_theme_constant_override("separation", 0)
	root.add_child(vbox)

	# ── Header bar ──
	var header_bg := ColorRect.new()
	header_bg.color = C_HEADER_BG
	header_bg.custom_minimum_size = Vector2(0, 40)
	vbox.add_child(header_bg)

	var header := HBoxContainer.new()
	header.set_anchors_preset(Control.PRESET_FULL_RECT)
	header.add_theme_constant_override("separation", 8)
	var hpad := _make_padding_container(header, 12, 0, 8, 0)
	header_bg.add_child(hpad)

	var title := Label.new()
	title.text = "BACKPACK"
	title.add_theme_font_size_override("font_size", 13)
	title.add_theme_color_override("font_color", C_ACCENT)
	title.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	header.add_child(title)

	_silver_lbl = Label.new()
	_silver_lbl.text = "Silver: %d" % PlayerData.silver
	_silver_lbl.add_theme_font_size_override("font_size", 10)
	_silver_lbl.add_theme_color_override("font_color", Color(0.80, 0.80, 0.90))
	header.add_child(_silver_lbl)

	var close_btn := _make_close_btn()
	close_btn.pressed.connect(func(): queue_free())
	header.add_child(close_btn)

	# ── Separator ──
	vbox.add_child(_make_hsep())

	# ── Category tabs ──
	var tab_row := HBoxContainer.new()
	tab_row.add_theme_constant_override("separation", 4)
	tab_row.custom_minimum_size = Vector2(0, 34)
	var tab_pad := _make_padding_container(tab_row, 10, 6, 10, 6)
	vbox.add_child(tab_pad)

	for i in CATEGORIES.size():
		var btn := _make_tab_btn(CATEGORIES[i], i == 0)
		var idx := i
		btn.pressed.connect(func(): _switch_cat(idx))
		tab_row.add_child(btn)
		_cat_btns.append(btn)

	vbox.add_child(_make_hsep())

	# ── Scroll area ──
	var scroll := ScrollContainer.new()
	scroll.size_flags_vertical = Control.SIZE_EXPAND_FILL
	scroll.horizontal_scroll_mode = ScrollContainer.SCROLL_MODE_DISABLED
	vbox.add_child(scroll)

	_content_box = VBoxContainer.new()
	_content_box.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	_content_box.add_theme_constant_override("separation", int(CELL_GAP))
	scroll.add_child(_content_box)

	# ── Consume bar (hidden until food selected) ──
	_consume_bar = _build_consume_bar()
	vbox.add_child(_consume_bar)

	_rebuild_items()

func _switch_cat(idx: int) -> void:
	_active_cat = idx
	for i in _cat_btns.size():
		_style_tab(_cat_btns[i], i == idx)
	_rebuild_items()

func _rebuild_items() -> void:
	for child in _content_box.get_children():
		child.queue_free()
	_cell_nodes.clear()

	if _selected_food != "" and ResourceManager.get_count(_selected_food) <= 0:
		_selected_food = ""
		if _consume_bar: _consume_bar.visible = false

	if _silver_lbl:
		_silver_lbl.text = "Silver: %d" % PlayerData.silver

	var filter: String = CAT_KEYS[_active_cat]
	var rows: Array = _get_filtered_items(filter)

	if rows.is_empty():
		var lbl := Label.new()
		lbl.text = "Nothing here yet."
		lbl.add_theme_color_override("font_color", C_TEXT_DIM)
		lbl.add_theme_font_size_override("font_size", 10)
		_content_box.add_child(lbl)
		return

	# Add 10px top margin
	var spacer := Control.new()
	spacer.custom_minimum_size = Vector2(0, 4)
	_content_box.add_child(spacer)

	var row_hbox: HBoxContainer = null
	var col := 0
	for entry in rows:
		if col == 0:
			row_hbox = HBoxContainer.new()
			row_hbox.add_theme_constant_override("separation", int(CELL_GAP))
			var row_pad := MarginContainer.new()
			row_pad.add_theme_constant_override("margin_left", 10)
			row_pad.add_theme_constant_override("margin_right", 10)
			row_pad.add_child(row_hbox)
			_content_box.add_child(row_pad)

		var cell: Control = _make_item_cell(entry["item_id"], entry["info"], entry["count"])
		row_hbox.add_child(cell)
		_cell_nodes.append(cell)
		col = (col + 1) % COLS

# ── Item cell ────────────────────────────────────────────────────────────

func _make_item_cell(item_id: String, info: Dictionary, count: int) -> Control:
	var cell := Control.new()
	cell.custom_minimum_size = Vector2(CELL_SIZE, CELL_SIZE)

	# Dark background
	var bg := ColorRect.new()
	bg.set_anchors_preset(Control.PRESET_FULL_RECT)
	bg.color = C_ITEM_BG
	cell.add_child(bg)

	# Thin outer border
	var bord := _make_border_rect(CELL_SIZE, CELL_SIZE, C_ITEM_BORD)
	cell.add_child(bord)

	# Category colour strip (left edge, 3px)
	var strip := ColorRect.new()
	strip.position = Vector2(0, 0)
	strip.size     = Vector2(3, CELL_SIZE)
	strip.color    = _cat_color(info.get("category", ""))
	cell.add_child(strip)

	# Icon
	var icon_path := "res://assets/sprites/items/%s.png" % item_id
	if ResourceLoader.exists(icon_path):
		var icon_tex := TextureRect.new()
		icon_tex.texture = load(icon_path)
		icon_tex.set_anchors_preset(Control.PRESET_CENTER)
		icon_tex.offset_left  = -22.0
		icon_tex.offset_top   = -22.0
		icon_tex.offset_right =  22.0
		icon_tex.offset_bottom =  22.0
		icon_tex.expand_mode  = TextureRect.EXPAND_IGNORE_SIZE
		icon_tex.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
		icon_tex.mouse_filter = Control.MOUSE_FILTER_IGNORE
		cell.add_child(icon_tex)

	# Item name (bottom, small)
	var name_lbl := Label.new()
	name_lbl.set_anchors_preset(Control.PRESET_FULL_RECT)
	name_lbl.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	name_lbl.vertical_alignment   = VERTICAL_ALIGNMENT_BOTTOM
	name_lbl.autowrap_mode        = TextServer.AUTOWRAP_WORD_SMART
	name_lbl.add_theme_font_size_override("font_size", 6)
	name_lbl.add_theme_color_override("font_color", C_TEXT_DIM)
	name_lbl.text = info.get("name", item_id)
	name_lbl.mouse_filter = Control.MOUSE_FILTER_IGNORE
	cell.add_child(name_lbl)

	# Count badge (bottom-right)
	var qty_lbl := Label.new()
	qty_lbl.set_anchors_preset(Control.PRESET_BOTTOM_RIGHT)
	qty_lbl.offset_left   = -30.0
	qty_lbl.offset_top    = -16.0
	qty_lbl.offset_right  =  -3.0
	qty_lbl.offset_bottom =  -2.0
	qty_lbl.horizontal_alignment = HORIZONTAL_ALIGNMENT_RIGHT
	qty_lbl.add_theme_font_size_override("font_size", 9)
	qty_lbl.add_theme_color_override("font_color", Color.WHITE)
	qty_lbl.text = "x%d" % count
	qty_lbl.mouse_filter = Control.MOUSE_FILTER_IGNORE
	cell.add_child(qty_lbl)

	cell.mouse_filter = Control.MOUSE_FILTER_STOP
	cell.tooltip_text = info.get("description", "")

	# Drag support
	var cap_id:    String = item_id
	var cap_name:  String = info.get("name", item_id)
	var cap_color: Color  = _cat_color(info.get("category", ""))

	var get_drag := func(_pos: Vector2) -> Variant:
		var preview := Control.new()
		preview.custom_minimum_size = Vector2(CELL_SIZE, CELL_SIZE)
		var pb := ColorRect.new()
		pb.set_anchors_preset(Control.PRESET_FULL_RECT)
		pb.color = cap_color
		pb.modulate.a = 0.85
		preview.add_child(pb)
		var pl := Label.new()
		pl.set_anchors_preset(Control.PRESET_FULL_RECT)
		pl.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
		pl.vertical_alignment   = VERTICAL_ALIGNMENT_CENTER
		pl.add_theme_font_size_override("font_size", 8)
		pl.text = cap_name
		preview.add_child(pl)
		cell.set_drag_preview(preview)
		return {"item_id": cap_id, "source": "backpack"}
	var cant_drop := func(_pos: Vector2, _data: Variant) -> bool: return false
	var no_drop   := func(_pos: Vector2, _data: Variant) -> void: pass
	cell.set_drag_forwarding(get_drag, cant_drop, no_drop)

	if info.get("category", "") == "placeables":
		cell.gui_input.connect(func(ev: InputEvent) -> void:
			if ev is InputEventMouseButton and ev.pressed and ev.button_index == MOUSE_BUTTON_LEFT:
				var grids := get_tree().get_nodes_in_group("slot_grid")
				if not grids.is_empty():
					grids[0].set_held_item(cap_id)
				queue_free()
		)
	elif info.get("category", "") == "food":
		var cap_info := info
		cell.gui_input.connect(func(ev: InputEvent) -> void:
			if ev is InputEventMouseButton and ev.pressed and ev.button_index == MOUSE_BUTTON_LEFT:
				_select_food(cap_id, cap_info)
		)

	return cell

# ── Consume bar ──────────────────────────────────────────────────────────

func _build_consume_bar() -> Control:
	var bar := VBoxContainer.new()
	bar.visible = false
	bar.add_theme_constant_override("separation", 0)

	var sep := ColorRect.new()
	sep.color = C_SEP
	sep.custom_minimum_size = Vector2(0, 1)
	bar.add_child(sep)

	var row := HBoxContainer.new()
	row.add_theme_constant_override("separation", 8)
	var pad := _make_padding_container(row, 12, 6, 12, 6)
	bar.add_child(pad)

	_consume_lbl = Label.new()
	_consume_lbl.add_theme_font_size_override("font_size", 9)
	_consume_lbl.add_theme_color_override("font_color", C_TEXT)
	_consume_lbl.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	_consume_lbl.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	row.add_child(_consume_lbl)

	_consume_btn = _make_action_btn("EAT")
	_consume_btn.custom_minimum_size = Vector2(80, 28)
	_consume_btn.pressed.connect(_on_eat_pressed)
	row.add_child(_consume_btn)

	return bar

func _select_food(item_id: String, info: Dictionary) -> void:
	_selected_food = item_id
	_selected_food_info = info
	var energy: int = info.get("energy_restore", 0)
	var name_str: String = info.get("name", item_id)
	_consume_lbl.text = "%s  +%d energy" % [name_str, energy] if energy > 0 else name_str
	var remaining: int = PlayerData.food_cooldown_remaining()
	if remaining > 0:
		_consume_btn.text = "Wait %ds" % remaining
		_consume_btn.disabled = true
	else:
		_consume_btn.text = "EAT"
		_consume_btn.disabled = false
	_consume_bar.visible = true

func _on_eat_pressed() -> void:
	if _selected_food == "": return
	if PlayerData.eat_food(_selected_food):
		ResourceManager.remove_item(_selected_food)
		var p: Node = get_tree().get_first_node_in_group("player")
		if p and p.has_method("play_drink"): p.call("play_drink")
	_selected_food = ""
	_consume_bar.visible = false
	_rebuild_items()

# ── Helper builders ──────────────────────────────────────────────────────

func _make_border_rect(w: float, h: float, col: Color = C_BORDER) -> Control:
	var c := Control.new()
	c.size = Vector2(w, h)
	c.mouse_filter = Control.MOUSE_FILTER_IGNORE
	for edge in [
		[Vector2(0, 0),     Vector2(w, 1)],
		[Vector2(0, h - 1), Vector2(w, 1)],
		[Vector2(0, 0),     Vector2(1, h)],
		[Vector2(w - 1, 0), Vector2(1, h)],
	]:
		var r := ColorRect.new()
		r.position = edge[0]; r.size = edge[1]; r.color = col
		r.mouse_filter = Control.MOUSE_FILTER_IGNORE
		c.add_child(r)
	return c

func _make_hsep() -> ColorRect:
	var s := ColorRect.new()
	s.color = C_SEP
	s.custom_minimum_size = Vector2(0, 1)
	return s

func _make_padding_container(child: Control, l: int, t: int, r: int, b: int) -> MarginContainer:
	var m := MarginContainer.new()
	m.add_theme_constant_override("margin_left",   l)
	m.add_theme_constant_override("margin_top",    t)
	m.add_theme_constant_override("margin_right",  r)
	m.add_theme_constant_override("margin_bottom", b)
	m.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	m.add_child(child)
	return m

func _make_close_btn() -> Button:
	var btn := Button.new()
	btn.text = "X"
	btn.custom_minimum_size = Vector2(28, 28)
	btn.add_theme_font_size_override("font_size", 10)
	var sn := StyleBoxFlat.new()
	sn.bg_color = Color(0, 0, 0, 0)
	sn.border_width_left = 1; sn.border_width_right = 1
	sn.border_width_top  = 1; sn.border_width_bottom = 1
	sn.border_color = C_BORDER
	btn.add_theme_stylebox_override("normal", sn)
	var sh := sn.duplicate() as StyleBoxFlat
	sh.bg_color = Color(0.5, 0.1, 0.1, 0.3)
	btn.add_theme_stylebox_override("hover", sh)
	btn.add_theme_color_override("font_color", C_TEXT_DIM)
	return btn

func _make_tab_btn(label: String, active: bool) -> Button:
	var btn := Button.new()
	btn.text = label
	btn.add_theme_font_size_override("font_size", 9)
	btn.toggle_mode = true
	btn.button_pressed = active
	_style_tab(btn, active)
	return btn

func _style_tab(btn: Button, active: bool) -> void:
	btn.button_pressed = active
	var s := StyleBoxFlat.new()
	s.bg_color     = C_TAB_ACTIVE if active else C_TAB_BG
	s.border_width_left = 1; s.border_width_right = 1
	s.border_width_top  = 1; s.border_width_bottom = 1
	s.border_color = C_ACCENT_DIM if active else C_BORDER
	s.corner_radius_top_left     = 4; s.corner_radius_top_right    = 4
	s.corner_radius_bottom_left  = 4; s.corner_radius_bottom_right = 4
	s.content_margin_left  = 8; s.content_margin_right  = 8
	s.content_margin_top   = 3; s.content_margin_bottom = 3
	btn.add_theme_stylebox_override("normal",   s)
	btn.add_theme_stylebox_override("pressed",  s)
	btn.add_theme_stylebox_override("hover",    s)
	btn.add_theme_color_override("font_color",
		C_ACCENT if active else C_TEXT_DIM)

func _make_action_btn(label: String, dimmed: bool = false) -> Button:
	var btn := Button.new()
	btn.text = label
	btn.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	btn.add_theme_font_size_override("font_size", 9)
	var s := StyleBoxFlat.new()
	s.bg_color = Color(0.784, 0.659, 0.294, 0.12) if not dimmed else Color(1,1,1,0.04)
	s.border_width_left = 1; s.border_width_right = 1
	s.border_width_top  = 1; s.border_width_bottom = 1
	s.border_color = C_ACCENT_DIM if not dimmed else C_BORDER
	s.corner_radius_top_left     = 4; s.corner_radius_top_right    = 4
	s.corner_radius_bottom_left  = 4; s.corner_radius_bottom_right = 4
	s.content_margin_left  = 8; s.content_margin_right  = 8
	s.content_margin_top   = 4; s.content_margin_bottom = 4
	btn.add_theme_stylebox_override("normal", s)
	btn.add_theme_color_override("font_color", C_ACCENT if not dimmed else C_TEXT_DIM)
	return btn

# ── Data ─────────────────────────────────────────────────────────────────

func _get_filtered_items(cat_filter: String) -> Array:
	var result: Array = []
	for item_id in ResourceManager.inventory:
		var count: int = ResourceManager.inventory[item_id]
		if count <= 0: continue
		if not ResourceManager.item_data.has(item_id): continue
		var info: Dictionary = ResourceManager.get_item_info(item_id)
		if cat_filter != "" and info.get("category", "") != cat_filter: continue
		result.append({"item_id": item_id, "info": info, "count": count})
	return result

func _cat_color(cat: String) -> Color:
	match cat:
		"seeds":      return Color(0.28, 0.68, 0.28)
		"materials":  return Color(0.52, 0.48, 0.40)
		"crops":      return Color(0.82, 0.68, 0.18)
		"food":       return Color(0.88, 0.48, 0.18)
		"tools":      return Color(0.32, 0.48, 0.72)
		"placeables": return Color(0.52, 0.35, 0.18)
		"recipes":    return Color(0.55, 0.28, 0.72)
	return Color(0.38, 0.38, 0.38)
