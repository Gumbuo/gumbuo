extends CanvasLayer

var _tab: int = 0
var _sell_item_id: String = ""
var _sell_qty: int = 1
var _sell_price: float = 0.1
var _list_panel: Control = null
var _status_lbl: Label = null
var _option_btn: OptionButton = null

func _ready() -> void:
	add_to_group("action_windows")
	layer = 25
	_build_ui()

func _build_ui() -> void:
	var overlay := ColorRect.new()
	overlay.set_anchors_preset(Control.PRESET_FULL_RECT)
	overlay.color = Color(0, 0, 0, 0.65)
	overlay.mouse_filter = Control.MOUSE_FILTER_STOP
	overlay.gui_input.connect(func(ev: InputEvent) -> void:
		if ev is InputEventMouseButton and ev.pressed:
			queue_free()
	)
	add_child(overlay)

	var panel := PanelContainer.new()
	panel.custom_minimum_size = Vector2(680, 540)
	panel.set_anchors_preset(Control.PRESET_CENTER)
	panel.offset_left = -340.0
	panel.offset_right = 340.0
	panel.offset_top = -270.0
	panel.offset_bottom = 270.0
	panel.mouse_filter = Control.MOUSE_FILTER_STOP
	add_child(panel)

	var root := VBoxContainer.new()
	root.add_theme_constant_override("separation", 6)
	panel.add_child(root)

	var header := HBoxContainer.new()
	root.add_child(header)

	var title := Label.new()
	title.text = "MARKET"
	title.add_theme_font_size_override("font_size", 20)
	title.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	title.modulate = Color(1.0, 0.9, 0.4)
	header.add_child(title)

	var close_btn := Button.new()
	close_btn.text = "X"
	close_btn.custom_minimum_size = Vector2(34, 34)
	close_btn.pressed.connect(func(): queue_free())
	header.add_child(close_btn)

	var tabs := HBoxContainer.new()
	tabs.add_theme_constant_override("separation", 2)
	root.add_child(tabs)

	var tab_names := ["Resources", "Land Deeds"]
	for i in tab_names.size():
		var tb := Button.new()
		tb.text = tab_names[i]
		tb.toggle_mode = true
		tb.button_pressed = i == 0
		var idx := i
		tb.pressed.connect(func(): _switch_tab(idx))
		tabs.add_child(tb)

	_status_lbl = Label.new()
	_status_lbl.add_theme_font_size_override("font_size", 10)
	_status_lbl.modulate = Color(0.4, 1.0, 0.4)
	_status_lbl.text = ""
	root.add_child(_status_lbl)

	_list_panel = VBoxContainer.new()
	_list_panel.size_flags_vertical = Control.SIZE_EXPAND_FILL
	root.add_child(_list_panel)

	root.add_child(HSeparator.new())
	_build_sell_form(root)

	_refresh_listings()

func _switch_tab(idx: int) -> void:
	_tab = idx
	_refresh_listings()

func _refresh_listings() -> void:
	for c in _list_panel.get_children():
		c.queue_free()

	var lbl := Label.new()
	lbl.add_theme_font_size_override("font_size", 10)
	lbl.modulate = Color(0.8, 0.8, 0.8)

	if _tab == 0:
		var listings := MarketManager.resource_listings
		if listings.is_empty():
			lbl.text = "No listings yet — be the first to sell!"
			_list_panel.add_child(lbl)
			return
		var scroll := ScrollContainer.new()
		scroll.size_flags_vertical = Control.SIZE_EXPAND_FILL
		scroll.horizontal_scroll_mode = ScrollContainer.SCROLL_MODE_DISABLED
		_list_panel.add_child(scroll)
		var vbox := VBoxContainer.new()
		vbox.add_theme_constant_override("separation", 3)
		scroll.add_child(vbox)
		for lid in listings:
			var entry: Dictionary = listings[lid]
			vbox.add_child(_make_resource_row(lid, entry))
	else:
		var listings := MarketManager.deed_listings
		if listings.is_empty():
			lbl.text = "No deed listings — earn deeds via BurnerStation."
			_list_panel.add_child(lbl)
			return
		var scroll := ScrollContainer.new()
		scroll.size_flags_vertical = Control.SIZE_EXPAND_FILL
		scroll.horizontal_scroll_mode = ScrollContainer.SCROLL_MODE_DISABLED
		_list_panel.add_child(scroll)
		var vbox := VBoxContainer.new()
		scroll.add_child(vbox)
		for lid in listings:
			var entry: Dictionary = listings[lid]
			vbox.add_child(_make_deed_row(lid, entry))

func _make_resource_row(lid: String, entry: Dictionary) -> HBoxContainer:
	var row := HBoxContainer.new()
	row.add_theme_constant_override("separation", 8)
	row.custom_minimum_size = Vector2(0, 40)

	var info: Dictionary = ResourceManager.get_item_info(entry["item_id"])

	var icon := TextureRect.new()
	icon.custom_minimum_size = Vector2(36, 36)
	icon.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	icon.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
	var icon_path := "res://assets/sprites/items/%s.png" % entry["item_id"]
	if ResourceLoader.exists(icon_path):
		icon.texture = load(icon_path)
	row.add_child(icon)

	var name_lbl := Label.new()
	name_lbl.text = info.get("name", entry["item_id"])
	name_lbl.custom_minimum_size = Vector2(110, 0)
	name_lbl.add_theme_font_size_override("font_size", 10)
	row.add_child(name_lbl)

	var qty_lbl := Label.new()
	qty_lbl.text = "x%d" % entry["quantity"]
	qty_lbl.custom_minimum_size = Vector2(36, 0)
	qty_lbl.add_theme_font_size_override("font_size", 10)
	row.add_child(qty_lbl)

	var price_lbl := Label.new()
	price_lbl.text = "%g G" % entry["price_gold"]
	price_lbl.custom_minimum_size = Vector2(60, 0)
	price_lbl.modulate = Color(1.0, 0.80, 0.15)
	price_lbl.add_theme_font_size_override("font_size", 10)
	row.add_child(price_lbl)

	var seller_lbl := Label.new()
	seller_lbl.text = _short_addr(entry["seller_id"])
	seller_lbl.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	seller_lbl.add_theme_font_size_override("font_size", 9)
	seller_lbl.modulate = Color(0.6, 0.6, 0.6)
	row.add_child(seller_lbl)

	if entry["seller_id"] == PlayerData.player_id:
		var cancel_btn := Button.new()
		cancel_btn.text = "Cancel"
		cancel_btn.add_theme_font_size_override("font_size", 9)
		cancel_btn.pressed.connect(func(): _cancel_listing(lid))
		row.add_child(cancel_btn)
	else:
		var buy_btn := Button.new()
		buy_btn.text = "Buy  (%g G)" % entry["price_gold"]
		buy_btn.add_theme_font_size_override("font_size", 9)
		buy_btn.disabled = PlayerData.gold < float(entry["price_gold"])
		buy_btn.pressed.connect(func(): _buy_resource(lid))
		row.add_child(buy_btn)

	return row

func _make_deed_row(lid: String, entry: Dictionary) -> HBoxContainer:
	var row := HBoxContainer.new()

	var name_lbl := Label.new()
	name_lbl.text = "Deed: %s" % str(entry.get("tile_id", "?"))
	name_lbl.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	name_lbl.add_theme_font_size_override("font_size", 10)
	row.add_child(name_lbl)

	var price_lbl := Label.new()
	price_lbl.text = "%g Gold" % entry["price_gold"]
	price_lbl.modulate = Color(1.0, 0.85, 0.2)
	price_lbl.add_theme_font_size_override("font_size", 10)
	row.add_child(price_lbl)

	if entry["seller_id"] != PlayerData.player_id:
		var buy_btn := Button.new()
		buy_btn.text = "Buy"
		buy_btn.disabled = PlayerData.gold + 0.00001 < float(entry["price_gold"])
		buy_btn.pressed.connect(func(): _buy_deed(lid))
		row.add_child(buy_btn)

	return row

func _build_sell_form(parent: VBoxContainer) -> void:
	var form := HBoxContainer.new()
	form.add_theme_constant_override("separation", 6)
	parent.add_child(form)

	var item_lbl := Label.new()
	item_lbl.text = "Sell:"
	item_lbl.add_theme_font_size_override("font_size", 10)
	form.add_child(item_lbl)

	_option_btn = OptionButton.new()
	_option_btn.custom_minimum_size = Vector2(130, 30)
	_option_btn.add_theme_font_size_override("font_size", 9)
	_option_btn.item_selected.connect(_on_item_selected)
	form.add_child(_option_btn)
	_populate_sellable_items()

	var qty_lbl := Label.new()
	qty_lbl.text = "Qty:"
	qty_lbl.add_theme_font_size_override("font_size", 10)
	form.add_child(qty_lbl)

	var qty_spin := SpinBox.new()
	qty_spin.min_value = 1
	qty_spin.max_value = 99
	qty_spin.value = 1
	qty_spin.custom_minimum_size = Vector2(60, 0)
	qty_spin.value_changed.connect(func(v: float): _sell_qty = int(v))
	form.add_child(qty_spin)

	var price_lbl := Label.new()
	price_lbl.text = "Price (G):"
	price_lbl.add_theme_font_size_override("font_size", 10)
	price_lbl.modulate = Color(1.0, 0.80, 0.15)
	form.add_child(price_lbl)

	var price_spin := SpinBox.new()
	price_spin.min_value = 0.01
	price_spin.max_value = 9999.0
	price_spin.step     = 0.05
	price_spin.value    = 0.1
	price_spin.custom_minimum_size = Vector2(75, 0)
	price_spin.value_changed.connect(func(v: float): _sell_price = v)
	form.add_child(price_spin)

	var post_btn := Button.new()
	post_btn.text = "Post Listing"
	post_btn.add_theme_font_size_override("font_size", 10)
	post_btn.pressed.connect(_on_post_pressed)
	form.add_child(post_btn)

const MARKET_CATEGORIES: Array = ["crops","materials","fish","food","livestock","consumables","seeds","recipes"]

func _populate_sellable_items() -> void:
	if not _option_btn:
		return
	_option_btn.clear()
	_sell_item_id = ""
	for iid in ResourceManager.inventory:
		if ResourceManager.inventory[iid] <= 0:
			continue
		var info: Dictionary = ResourceManager.get_item_info(iid)
		if not MARKET_CATEGORIES.has(info.get("category", "")):
			continue
		var n: String = info.get("name", iid)
		_option_btn.add_item("%s (x%d)" % [n, ResourceManager.inventory[iid]])
		_option_btn.set_item_metadata(_option_btn.item_count - 1, iid)
	if _option_btn.item_count > 0:
		_sell_item_id = _option_btn.get_item_metadata(0)

func _on_item_selected(idx: int) -> void:
	_sell_item_id = _option_btn.get_item_metadata(idx)

func _on_post_pressed() -> void:
	if _sell_item_id == "":
		_show_status("Select an item to sell.")
		return
	if not ResourceManager.has_item(_sell_item_id, _sell_qty):
		_show_status("Not enough %s in backpack." % _sell_item_id)
		return
	if MarketManager.list_resource(_sell_item_id, _sell_qty, _sell_price as float):
		_show_status("Listed successfully!")
		_populate_sellable_items()
		_refresh_listings()
	else:
		_show_status("Could not post listing.")

func _buy_resource(lid: String) -> void:
	if MarketManager.buy_resource(lid):
		_show_status("Purchased!")
		_refresh_listings()
	else:
		_show_status("Not enough Gold.")

func _buy_deed(lid: String) -> void:
	if MarketManager.buy_deed(lid):
		_show_status("Deed purchased!")
		_refresh_listings()
	else:
		_show_status("Not enough Gold.")

func _cancel_listing(lid: String) -> void:
	MarketManager.cancel_resource_listing(lid)
	_show_status("Listing cancelled.")
	_populate_sellable_items()
	_refresh_listings()

func _show_status(msg: String) -> void:
	if _status_lbl:
		_status_lbl.text = msg

func _short_addr(addr: String) -> String:
	if addr.length() > 12:
		return addr.substr(0, 6) + "..." + addr.substr(addr.length() - 4)
	return addr
