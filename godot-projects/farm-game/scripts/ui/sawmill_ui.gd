extends CanvasLayer

signal closed
signal item_crafted(item_id: String, count: int)

const BORDER_COLOR := Color(0.35, 0.22, 0.08)
const TITLE_COLOR  := Color(0.78, 0.60, 0.30)

var _tile_id:   String = ""
var _craft_btn: Button = null
var _cost_lbl:  Label  = null
var _have_lbl:  Label  = null

func _ready() -> void:
	layer = 30

func setup_context(t_id: String) -> void:
	_tile_id = t_id
	_build_ui()

func _is_own_mill() -> bool:
	if _tile_id == "": return true
	return LandManager.tiles.get(_tile_id, {}).get("owner_id", "") == PlayerData.player_id

func _close() -> void:
	closed.emit()
	queue_free()

func _input(event: InputEvent) -> void:
	if event is InputEventKey and event.pressed and event.keycode == KEY_ESCAPE:
		get_viewport().set_input_as_handled()
		_close()

func _build_ui() -> void:
	var pw := 580; var ph := 300
	var root := Control.new()
	root.set_anchors_preset(Control.PRESET_FULL_RECT)
	root.mouse_filter = Control.MOUSE_FILTER_STOP
	add_child(root)

	var dim := ColorRect.new()
	dim.set_anchors_preset(Control.PRESET_FULL_RECT)
	dim.color = Color(0, 0, 0, 0.55)
	dim.mouse_filter = Control.MOUSE_FILTER_IGNORE
	root.add_child(dim)

	var panel := Control.new()
	panel.position = Vector2((1280 - pw) / 2.0, (720 - ph) / 2.0)
	panel.size     = Vector2(pw, ph)
	root.add_child(panel)

	var border := ColorRect.new()
	border.set_anchors_preset(Control.PRESET_FULL_RECT)
	border.color = BORDER_COLOR
	border.mouse_filter = Control.MOUSE_FILTER_IGNORE
	panel.add_child(border)

	var inner := ColorRect.new()
	inner.position = Vector2(1, 1)
	inner.size     = Vector2(pw - 2, ph - 2)
	inner.color    = Color(0.07, 0.07, 0.09, 0.98)
	inner.mouse_filter = Control.MOUSE_FILTER_IGNORE
	panel.add_child(inner)

	var tbar := ColorRect.new()
	tbar.position = Vector2(1, 1)
	tbar.size     = Vector2(pw - 2, 38)
	tbar.color    = Color(BORDER_COLOR.r * 0.4, BORDER_COLOR.g * 0.4, BORDER_COLOR.b * 0.4)
	tbar.mouse_filter = Control.MOUSE_FILTER_IGNORE
	panel.add_child(tbar)

	var title := Label.new()
	title.position = Vector2(16, 10)
	title.size     = Vector2(pw - 80, 22)
	title.text     = "SAWMILL  —  LOGS TO PLANKS"
	title.add_theme_font_size_override("font_size", 13)
	title.modulate = TITLE_COLOR
	panel.add_child(title)

	var close_btn := Button.new()
	close_btn.position = Vector2(pw - 46, 6)
	close_btn.size     = Vector2(38, 26)
	close_btn.text     = "X"
	close_btn.pressed.connect(_close)
	panel.add_child(close_btn)

	var own_mill := _is_own_mill()
	var desc_text: String
	if own_mill:
		desc_text = "Your sawmill: 1 Wood → 3 Wood Planks"
	else:
		desc_text = "Other player's sawmill: 2 Wood → 3 Wood Planks for you + 3 Wood Planks to the mill owner's vault"

	var desc := Label.new()
	desc.position = Vector2(16, 44)
	desc.size     = Vector2(pw - 32, 40)
	desc.text     = desc_text
	desc.add_theme_font_size_override("font_size", 9)
	desc.modulate = Color(0.65, 0.65, 0.65)
	desc.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	panel.add_child(desc)

	var wood_dot := ColorRect.new()
	wood_dot.position = Vector2(16, 100)
	wood_dot.size     = Vector2(10, 10)
	wood_dot.color    = Color(0.55, 0.35, 0.15)
	wood_dot.mouse_filter = Control.MOUSE_FILTER_IGNORE
	panel.add_child(wood_dot)

	_cost_lbl = Label.new()
	_cost_lbl.position = Vector2(30, 96)
	_cost_lbl.size     = Vector2(300, 18)
	_cost_lbl.add_theme_font_size_override("font_size", 10)
	panel.add_child(_cost_lbl)

	_have_lbl = Label.new()
	_have_lbl.position = Vector2(16, 120)
	_have_lbl.size     = Vector2(340, 18)
	_have_lbl.add_theme_font_size_override("font_size", 9)
	_have_lbl.modulate = Color(0.55, 0.55, 0.55)
	panel.add_child(_have_lbl)

	var plank_dot := ColorRect.new()
	plank_dot.position = Vector2(16, 148)
	plank_dot.size     = Vector2(10, 10)
	plank_dot.color    = Color(0.72, 0.52, 0.28)
	plank_dot.mouse_filter = Control.MOUSE_FILTER_IGNORE
	panel.add_child(plank_dot)

	var output_lbl := Label.new()
	output_lbl.position = Vector2(30, 144)
	output_lbl.size     = Vector2(300, 18)
	output_lbl.text     = "Produces: 3 Wood Planks"
	output_lbl.add_theme_font_size_override("font_size", 9)
	output_lbl.modulate = Color(0.72, 0.52, 0.28)
	panel.add_child(output_lbl)

	var btn_label: String = "SAW  (1 Wood → 3 Planks)" if own_mill else "SAW  (2 Wood → 3 Planks)"
	_craft_btn = Button.new()
	_craft_btn.position = Vector2(pw - 200, 92)
	_craft_btn.size     = Vector2(168, 40)
	_craft_btn.text     = btn_label
	_craft_btn.add_theme_font_size_override("font_size", 9)
	_craft_btn.pressed.connect(_do_saw)
	panel.add_child(_craft_btn)

	_refresh_ui()

func _refresh_ui() -> void:
	var own_mill := _is_own_mill()
	var cost: int = 1 if own_mill else 2
	var have: int = ResourceManager.get_count("wood")
	if is_instance_valid(_cost_lbl):
		_cost_lbl.text    = "Wood  %d / %d" % [have, cost]
		_cost_lbl.modulate = Color(0.3, 0.7, 1.0) if have >= cost else Color(1.0, 0.4, 0.4)
	if is_instance_valid(_have_lbl):
		_have_lbl.text = "In backpack: %d wood" % have
	if is_instance_valid(_craft_btn):
		_craft_btn.disabled = have < cost

func _do_saw() -> void:
	var own_mill := _is_own_mill()
	var cost: int = 1 if own_mill else 2
	if not ResourceManager.has_item("wood", cost): return
	ResourceManager.remove_item("wood", cost)
	ResourceManager.add_item("wood_plank", 3)
	item_crafted.emit("wood_plank", 3)
	if not own_mill:
		LandManager.add_to_passive_vault(_tile_id, "wood_plank", 3)
	_refresh_ui()
