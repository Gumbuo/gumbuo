extends CanvasLayer

signal closed

const ITEM_H  := 44.0
const PANEL_W := 500.0
const MAX_LIST_H := 380.0

var _npc_data:  Dictionary = {}
var _silver_lbl: Label = null
var _gold_lbl:   Label = null
var _list:       VBoxContainer = null
var _tab_buy:    Button = null
var _tab_sell:   Button = null

func setup(npc_data: Dictionary) -> void:
	_npc_data = npc_data
	_build_ui()

func _build_ui() -> void:
	var overlay := ColorRect.new()
	overlay.set_anchors_preset(Control.PRESET_FULL_RECT)
	overlay.color = Color(0, 0, 0, 0.55)
	overlay.mouse_filter = Control.MOUSE_FILTER_STOP
	add_child(overlay)
	overlay.gui_input.connect(func(ev):
		if ev is InputEventMouseButton and ev.pressed:
			closed.emit()
			queue_free()
	)

	var inventory: Array = _npc_data.get("inventory", [])
	var buys: Array      = _npc_data.get("buys", [])
	var has_buy:  bool   = inventory.size() > 0
	var has_sell: bool   = buys.size() > 0
	var list_count: int  = max(inventory.size(), buys.size())
	var list_h: float    = minf(list_count * ITEM_H, MAX_LIST_H)
	var tab_h: float     = 34.0 if (has_buy and has_sell) else 0.0
	var panel_h: float   = 148.0 + tab_h + list_h

	var panel := PanelContainer.new()
	panel.custom_minimum_size = Vector2(PANEL_W, panel_h)
	panel.set_anchors_preset(Control.PRESET_CENTER)
	panel.offset_left   = -PANEL_W / 2.0
	panel.offset_right  =  PANEL_W / 2.0
	panel.offset_top    = -panel_h / 2.0
	panel.offset_bottom =  panel_h / 2.0
	add_child(panel)

	var vbox := VBoxContainer.new()
	vbox.add_theme_constant_override("separation", 6)
	panel.add_child(vbox)

	# --- header ---
	var header := HBoxContainer.new()
	header.add_theme_constant_override("separation", 10)
	vbox.add_child(header)

	var portrait_path: String = _npc_data.get("portrait", "")
	if portrait_path != "" and ResourceLoader.exists(portrait_path):
		var tex: Texture2D = load(portrait_path)
		if tex:
			var portrait := TextureRect.new()
			portrait.texture = tex
			portrait.expand_mode = TextureRect.EXPAND_KEEP_SIZE
			portrait.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
			portrait.custom_minimum_size = Vector2(52, 64)
			header.add_child(portrait)

	var title_col := VBoxContainer.new()
	title_col.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	header.add_child(title_col)

	var title := Label.new()
	title.text = _npc_data.get("shop_name", "Shop")
	title.add_theme_font_size_override("font_size", 16)
	title_col.add_child(title)

	var sub := Label.new()
	sub.text = _npc_data.get("name", "")
	sub.add_theme_font_size_override("font_size", 11)
	sub.modulate = Color(0.75, 0.75, 0.75)
	title_col.add_child(sub)

	var close_btn := Button.new()
	close_btn.text = "X"
	close_btn.custom_minimum_size = Vector2(32, 32)
	close_btn.pressed.connect(func():
		closed.emit()
		queue_free()
	)
	header.add_child(close_btn)

	var desc := Label.new()
	desc.text = _npc_data.get("description", "")
	desc.add_theme_font_size_override("font_size", 11)
	desc.modulate = Color(0.8, 0.8, 0.8)
	desc.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	vbox.add_child(desc)

	# --- balance row ---
	var bal_row := HBoxContainer.new()
	bal_row.add_theme_constant_override("separation", 16)
	vbox.add_child(bal_row)

	_silver_lbl = Label.new()
	_silver_lbl.text = "Silver: %d" % PlayerData.silver
	_silver_lbl.add_theme_font_size_override("font_size", 12)
	_silver_lbl.modulate = Color(1.0, 0.92, 0.4)
	bal_row.add_child(_silver_lbl)

	_gold_lbl = Label.new()
	_gold_lbl.text = "Gold: %g" % PlayerData.gold
	_gold_lbl.add_theme_font_size_override("font_size", 12)
	_gold_lbl.modulate = Color(1.0, 0.75, 0.1)
	bal_row.add_child(_gold_lbl)

	vbox.add_child(HSeparator.new())

	# --- buy / sell tabs (only when NPC does both) ---
	if has_buy and has_sell:
		var tab_row := HBoxContainer.new()
		tab_row.add_theme_constant_override("separation", 4)
		vbox.add_child(tab_row)

		_tab_buy = Button.new()
		_tab_buy.text = "Buy"
		_tab_buy.toggle_mode = true
		_tab_buy.button_pressed = true
		_tab_buy.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		_tab_buy.pressed.connect(func(): _switch_tab("buy"))
		tab_row.add_child(_tab_buy)

		_tab_sell = Button.new()
		_tab_sell.text = "Sell Fish"
		_tab_sell.toggle_mode = true
		_tab_sell.button_pressed = false
		_tab_sell.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		_tab_sell.pressed.connect(func(): _switch_tab("sell"))
		tab_row.add_child(_tab_sell)

	# --- scrollable list ---
	var scroll := ScrollContainer.new()
	scroll.custom_minimum_size = Vector2(PANEL_W - 20, list_h)
	scroll.size_flags_vertical = Control.SIZE_EXPAND_FILL
	vbox.add_child(scroll)

	_list = VBoxContainer.new()
	_list.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	_list.add_theme_constant_override("separation", 4)
	scroll.add_child(_list)

	if has_buy:
		_fill_buy_list()
	elif has_sell:
		_fill_sell_list()

func _switch_tab(mode: String) -> void:
	if _tab_buy:  _tab_buy.button_pressed  = mode == "buy"
	if _tab_sell: _tab_sell.button_pressed = mode == "sell"
	for child in _list.get_children():
		child.queue_free()
	if mode == "buy":
		_fill_buy_list()
	else:
		_fill_sell_list()

func _fill_buy_list() -> void:
	for entry in _npc_data.get("inventory", []):
		var item_id: String = entry.get("item_id", "")
		var price_s: int    = entry.get("price_silver", 0)
		var price_g: float  = float(entry.get("price_gold", 0))
		var qty: int        = entry.get("quantity", 1)
		var use_gold: bool  = price_g > 0.0
		var info: Dictionary = ResourceManager.get_item_info(item_id)
		_list.add_child(_make_buy_row(item_id, info.get("name", item_id), price_s, price_g, use_gold, qty))

func _fill_sell_list() -> void:
	for entry in _npc_data.get("buys", []):
		var item_id: String  = entry.get("item_id", "")
		var price_g: float   = float(entry.get("price_gold", 0))
		var info: Dictionary = ResourceManager.get_item_info(item_id)
		_list.add_child(_make_sell_row(item_id, info.get("name", item_id), price_g))

func _make_buy_row(item_id: String, item_name: String, price_s: int, price_g: float, use_gold: bool, qty: int = 1) -> HBoxContainer:
	var row := HBoxContainer.new()
	row.custom_minimum_size = Vector2(0, ITEM_H - 8)
	row.add_theme_constant_override("separation", 8)

	_add_icon_or_swatch(row, item_id)

	var name_lbl := Label.new()
	name_lbl.text = item_name if qty == 1 else "%s (x%d)" % [item_name, qty]
	name_lbl.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	name_lbl.add_theme_font_size_override("font_size", 12)
	row.add_child(name_lbl)

	var price_lbl := Label.new()
	if use_gold:
		price_lbl.text = "%g Gold" % price_g
		price_lbl.modulate = Color(1.0, 0.75, 0.1)
	else:
		price_lbl.text = "%d Silver" % price_s
		price_lbl.modulate = Color(1.0, 0.92, 0.4)
	price_lbl.add_theme_font_size_override("font_size", 12)
	row.add_child(price_lbl)

	var buy_btn := Button.new()
	buy_btn.text = "Buy"
	buy_btn.custom_minimum_size = Vector2(52, 30)
	buy_btn.pressed.connect(func(): _buy(item_id, price_s, price_g, use_gold, qty))
	row.add_child(buy_btn)

	return row

func _make_sell_row(item_id: String, item_name: String, price_g: float) -> HBoxContainer:
	var row := HBoxContainer.new()
	row.custom_minimum_size = Vector2(0, ITEM_H - 8)
	row.add_theme_constant_override("separation", 8)

	_add_icon_or_swatch(row, item_id)

	var held: int = ResourceManager.get_count(item_id)

	var name_lbl := Label.new()
	name_lbl.text = "%s  (x%d)" % [item_name, held]
	name_lbl.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	name_lbl.add_theme_font_size_override("font_size", 12)
	row.add_child(name_lbl)

	var price_lbl := Label.new()
	price_lbl.text = "%g Gold each" % price_g
	price_lbl.modulate = Color(1.0, 0.75, 0.1)
	price_lbl.add_theme_font_size_override("font_size", 12)
	row.add_child(price_lbl)

	var sell_btn := Button.new()
	sell_btn.text = "Sell"
	sell_btn.custom_minimum_size = Vector2(52, 30)
	sell_btn.disabled = held <= 0
	sell_btn.pressed.connect(func(): _sell(item_id, price_g, name_lbl, sell_btn))
	row.add_child(sell_btn)

	return row

func _add_icon_or_swatch(row: HBoxContainer, item_id: String) -> void:
	var icon_path := "res://assets/sprites/items/%s.png" % item_id
	if ResourceLoader.exists(icon_path):
		var icon_tex := TextureRect.new()
		icon_tex.texture = load(icon_path)
		icon_tex.custom_minimum_size = Vector2(28, 28)
		icon_tex.expand_mode = TextureRect.EXPAND_KEEP_SIZE
		icon_tex.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
		row.add_child(icon_tex)
	else:
		var swatch := ColorRect.new()
		swatch.custom_minimum_size = Vector2(28, 28)
		swatch.color = _cat_color(ResourceManager.get_item_info(item_id).get("category", ""))
		row.add_child(swatch)

func _buy(item_id: String, price_s: int, price_g: float, use_gold: bool, qty: int = 1) -> void:
	if use_gold:
		if not PlayerData.spend_gold(price_g):
			return
		_gold_lbl.text = "Gold: %g" % PlayerData.gold
	else:
		if not PlayerData.spend_silver(price_s):
			return
		_silver_lbl.text = "Silver: %d" % PlayerData.silver
	ResourceManager.add_item(item_id, qty)

func _sell(item_id: String, price_g: float, name_lbl: Label, sell_btn: Button) -> void:
	if not ResourceManager.has_item(item_id):
		return
	ResourceManager.remove_item(item_id, 1)
	PlayerData.add_gold(price_g)
	_gold_lbl.text = "Gold: %g" % PlayerData.gold
	var held: int = ResourceManager.get_count(item_id)
	var info: Dictionary = ResourceManager.get_item_info(item_id)
	name_lbl.text = "%s  (x%d)" % [info.get("name", item_id), held]
	sell_btn.disabled = held <= 0

func _cat_color(cat: String) -> Color:
	match cat:
		"seeds":      return Color(0.3,  0.75, 0.3)
		"materials":  return Color(0.55, 0.52, 0.45)
		"crops":      return Color(0.85, 0.72, 0.2)
		"food":       return Color(0.9,  0.5,  0.2)
		"tools":      return Color(0.35, 0.5,  0.75)
		"placeables": return Color(0.55, 0.38, 0.2)
		"recipes":    return Color(0.6,  0.3,  0.75)
		"decor":      return Color(0.7,  0.4,  0.7)
		"fish":       return Color(0.2,  0.5,  0.8)
	return Color(0.4, 0.4, 0.4)
