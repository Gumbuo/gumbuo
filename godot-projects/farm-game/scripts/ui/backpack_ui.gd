extends CanvasLayer

const CELL_SIZE := 72.0
const CELL_GAP := 6.0
const COLS := 6

const CATEGORIES := ["All", "Seeds", "Materials", "Crops", "Food", "Tools", "Placeables", "Decor", "Recipes"]
const CAT_KEYS   := ["",    "seeds", "materials", "crops", "food", "tools", "placeables",  "decor", "recipes"]

var _active_cat: int = 0
var _cell_nodes: Array = []
var _content_box: VBoxContainer = null
var _silver_lbl: Label = null
var _cat_btns: Array = []

func _ready() -> void:
	_build_ui()

func refresh() -> void:
	_rebuild_items()

func _build_ui() -> void:
	var panel := PanelContainer.new()
	panel.custom_minimum_size = Vector2(560, 300)
	panel.set_anchors_preset(Control.PRESET_TOP_LEFT)
	panel.offset_left   = 360.0
	panel.offset_right  = 920.0
	panel.offset_top    = 8.0
	panel.offset_bottom = 368.0
	add_child(panel)

	var vbox := VBoxContainer.new()
	vbox.add_theme_constant_override("separation", 6)
	panel.add_child(vbox)

	var header := HBoxContainer.new()
	vbox.add_child(header)

	var title := Label.new()
	title.text = "BACKPACK"
	title.add_theme_font_size_override("font_size", 18)
	title.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	header.add_child(title)

	_silver_lbl = Label.new()
	_silver_lbl.text = "Silver: %d" % PlayerData.silver
	_silver_lbl.add_theme_font_size_override("font_size", 13)
	_silver_lbl.modulate = Color(1.0, 0.92, 0.4)
	header.add_child(_silver_lbl)

	var close_btn := Button.new()
	close_btn.text = "X"
	close_btn.custom_minimum_size = Vector2(32, 32)
	close_btn.pressed.connect(func(): queue_free())
	header.add_child(close_btn)

	var cat_row := HBoxContainer.new()
	cat_row.add_theme_constant_override("separation", 3)
	vbox.add_child(cat_row)

	for i in CATEGORIES.size():
		var btn := Button.new()
		btn.text = CATEGORIES[i]
		btn.add_theme_font_size_override("font_size", 10)
		btn.toggle_mode = true
		btn.button_pressed = i == 0
		var idx := i
		btn.pressed.connect(func(): _switch_cat(idx))
		cat_row.add_child(btn)
		_cat_btns.append(btn)

	var scroll := ScrollContainer.new()
	scroll.size_flags_vertical = Control.SIZE_EXPAND_FILL
	scroll.horizontal_scroll_mode = ScrollContainer.SCROLL_MODE_DISABLED
	vbox.add_child(scroll)

	_content_box = VBoxContainer.new()
	_content_box.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	scroll.add_child(_content_box)

	_rebuild_items()

func _switch_cat(idx: int) -> void:
	_active_cat = idx
	for i in _cat_btns.size():
		_cat_btns[i].button_pressed = (i == idx)
	_rebuild_items()

func _rebuild_items() -> void:
	for child in _content_box.get_children():
		child.queue_free()
	_cell_nodes.clear()

	if _silver_lbl:
		_silver_lbl.text = "Silver: %d" % PlayerData.silver

	var filter: String = CAT_KEYS[_active_cat]
	var rows: Array = _get_filtered_items(filter)

	if rows.is_empty():
		var lbl := Label.new()
		lbl.text = "Nothing here yet."
		lbl.modulate = Color(0.6, 0.6, 0.6)
		_content_box.add_child(lbl)
		return

	var row_hbox: HBoxContainer = null
	var col := 0
	for entry in rows:
		if col == 0:
			row_hbox = HBoxContainer.new()
			row_hbox.add_theme_constant_override("separation", int(CELL_GAP))
			_content_box.add_child(row_hbox)

		var cell: Control = _make_item_cell(entry["item_id"], entry["info"], entry["count"])
		row_hbox.add_child(cell)
		_cell_nodes.append(cell)
		col = (col + 1) % COLS

func _get_filtered_items(cat_filter: String) -> Array:
	var result: Array = []
	for item_id in ResourceManager.inventory:
		var count: int = ResourceManager.inventory[item_id]
		if count <= 0:
			continue
		if not ResourceManager.item_data.has(item_id):
			continue
		var info: Dictionary = ResourceManager.get_item_info(item_id)
		if cat_filter != "" and info.get("category", "") != cat_filter:
			continue
		result.append({"item_id": item_id, "info": info, "count": count})
	return result

func _make_item_cell(item_id: String, info: Dictionary, count: int) -> Control:
	var cell := Control.new()
	cell.custom_minimum_size = Vector2(CELL_SIZE, CELL_SIZE)

	var bg := ColorRect.new()
	bg.set_anchors_preset(Control.PRESET_FULL_RECT)
	bg.color = _cat_color(info.get("category", ""))
	cell.add_child(bg)

	var icon_path := "res://assets/sprites/items/%s.png" % item_id
	var has_icon := ResourceLoader.exists(icon_path)
	if has_icon:
		var icon_tex := TextureRect.new()
		icon_tex.texture = load(icon_path)
		icon_tex.set_anchors_preset(Control.PRESET_CENTER)
		icon_tex.offset_left = -24.0
		icon_tex.offset_top = -24.0
		icon_tex.offset_right = 24.0
		icon_tex.offset_bottom = 24.0
		icon_tex.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
		icon_tex.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
		icon_tex.mouse_filter = Control.MOUSE_FILTER_IGNORE
		cell.add_child(icon_tex)

	var name_lbl := Label.new()
	name_lbl.set_anchors_preset(Control.PRESET_FULL_RECT)
	name_lbl.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	name_lbl.vertical_alignment = VERTICAL_ALIGNMENT_BOTTOM
	name_lbl.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	name_lbl.add_theme_font_size_override("font_size", 7)
	name_lbl.add_theme_color_override("font_color", Color(1, 1, 1, 0.85))
	name_lbl.text = info.get("name", item_id)
	cell.add_child(name_lbl)

	var qty_lbl := Label.new()
	qty_lbl.set_anchors_preset(Control.PRESET_BOTTOM_RIGHT)
	qty_lbl.offset_left = -28.0
	qty_lbl.offset_top = -18.0
	qty_lbl.offset_right = -2.0
	qty_lbl.offset_bottom = -2.0
	qty_lbl.horizontal_alignment = HORIZONTAL_ALIGNMENT_RIGHT
	qty_lbl.add_theme_font_size_override("font_size", 10)
	qty_lbl.text = "x%d" % count
	qty_lbl.modulate = Color.WHITE
	cell.add_child(qty_lbl)

	cell.mouse_filter = Control.MOUSE_FILTER_STOP
	cell.tooltip_text = info.get("description", "")

	var cap_id: String = item_id
	var cap_name: String = info.get("name", item_id)
	var cap_color: Color = _cat_color(info.get("category", ""))

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
		pl.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
		pl.add_theme_font_size_override("font_size", 8)
		pl.text = cap_name
		preview.add_child(pl)
		cell.set_drag_preview(preview)
		return {"item_id": cap_id, "source": "backpack"}
	var cant_drop := func(_pos: Vector2, _data: Variant) -> bool: return false
	var no_drop := func(_pos: Vector2, _data: Variant) -> void: pass
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
				_show_eat_popup(cap_id, cap_info, ev.global_position)
		)

	return cell

func _show_eat_popup(item_id: String, info: Dictionary, screen_pos: Vector2) -> void:
	for child in get_tree().root.get_children():
		if child.name == "EatPopup":
			child.queue_free()

	var popup := CanvasLayer.new()
	popup.name  = "EatPopup"
	popup.layer = 35
	get_tree().root.add_child(popup)

	var overlay := ColorRect.new()
	overlay.set_anchors_preset(Control.PRESET_FULL_RECT)
	overlay.color = Color(0, 0, 0, 0.0)
	overlay.mouse_filter = Control.MOUSE_FILTER_STOP
	overlay.gui_input.connect(func(ev: InputEvent) -> void:
		if ev is InputEventMouseButton and ev.pressed:
			popup.queue_free()
	)
	popup.add_child(overlay)

	var panel := PanelContainer.new()
	panel.position = Vector2(clamp(screen_pos.x, 0, 1040), clamp(screen_pos.y - 100, 0, 600))
	panel.custom_minimum_size = Vector2(200, 0)
	popup.add_child(panel)

	var vbox := VBoxContainer.new()
	vbox.add_theme_constant_override("separation", 5)
	panel.add_child(vbox)

	var name_lbl := Label.new()
	name_lbl.text = info.get("name", item_id)
	name_lbl.add_theme_font_size_override("font_size", 12)
	name_lbl.modulate = Color(1.0, 0.9, 0.4)
	vbox.add_child(name_lbl)

	var energy: int = info.get("energy_restore", 0)
	var desc_lbl := Label.new()
	desc_lbl.text = ("Restores %d energy" % energy) if energy > 0 else info.get("description", "")
	desc_lbl.add_theme_font_size_override("font_size", 9)
	desc_lbl.modulate = Color(0.7, 0.7, 0.7)
	vbox.add_child(desc_lbl)

	vbox.add_child(HSeparator.new())

	var eat_btn := Button.new()
	var remaining: int = PlayerData.food_cooldown_remaining()
	if remaining > 0:
		eat_btn.text     = "On cooldown (%ds)" % remaining
		eat_btn.disabled = true
	else:
		eat_btn.text = "EAT"
		var cap_id := item_id
		eat_btn.pressed.connect(func():
			if PlayerData.eat_food(cap_id):
				ResourceManager.remove_item(cap_id)
				_rebuild_items()
				var _p: Node = get_tree().get_first_node_in_group("player")
				if _p and _p.has_method("play_drink"): _p.call("play_drink")
			popup.queue_free()
		)
	vbox.add_child(eat_btn)

	var cancel_btn := Button.new()
	cancel_btn.text = "Cancel"
	cancel_btn.add_theme_font_size_override("font_size", 9)
	cancel_btn.pressed.connect(func(): popup.queue_free())
	vbox.add_child(cancel_btn)

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
