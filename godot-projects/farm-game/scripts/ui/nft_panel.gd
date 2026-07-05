extends CanvasLayer

var _tab: int = 0
var _tab_btns: Array = []
var _content: VBoxContainer = null

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
	panel.custom_minimum_size = Vector2(580, 480)
	panel.set_anchors_preset(Control.PRESET_CENTER)
	panel.offset_left = -290.0
	panel.offset_right = 290.0
	panel.offset_top = -240.0
	panel.offset_bottom = 240.0
	panel.mouse_filter = Control.MOUSE_FILTER_STOP
	add_child(panel)

	var root := VBoxContainer.new()
	root.add_theme_constant_override("separation", 6)
	panel.add_child(root)

	var header := HBoxContainer.new()
	root.add_child(header)

	var title := Label.new()
	title.text = "NFT WALLET"
	title.add_theme_font_size_override("font_size", 18)
	title.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	title.modulate = Color(0.6, 0.4, 1.0)
	header.add_child(title)

	var close_btn := Button.new()
	close_btn.text = "X"
	close_btn.custom_minimum_size = Vector2(34, 34)
	close_btn.pressed.connect(func(): queue_free())
	header.add_child(close_btn)

	var tab_row := HBoxContainer.new()
	tab_row.add_theme_constant_override("separation", 2)
	root.add_child(tab_row)

	var tab_names := ["In-Game Items", "On-Chain Deeds"]
	for i in tab_names.size():
		var btn := Button.new()
		btn.text = tab_names[i]
		btn.toggle_mode = true
		btn.button_pressed = i == 0
		var idx := i
		btn.pressed.connect(func(): _switch_tab(idx, tab_row.get_children()))
		tab_row.add_child(btn)
		_tab_btns.append(btn)

	root.add_child(HSeparator.new())

	_content = VBoxContainer.new()
	_content.size_flags_vertical = Control.SIZE_EXPAND_FILL
	_content.add_theme_constant_override("separation", 6)
	root.add_child(_content)

	_show_in_game_items()

func _switch_tab(idx: int, _btns: Array) -> void:
	_tab = idx
	for i in _tab_btns.size():
		_tab_btns[i].button_pressed = (i == idx)
	if idx == 0:
		_show_in_game_items()
	else:
		_show_onchain_deeds()

func _show_in_game_items() -> void:
	for c in _content.get_children():
		c.queue_free()

	var header_lbl := Label.new()
	header_lbl.text = "Placeables in your backpack (not yet placed on a tile):"
	header_lbl.add_theme_font_size_override("font_size", 10)
	header_lbl.modulate = Color(0.8, 0.8, 0.8)
	_content.add_child(header_lbl)

	var placeables: Array = [
		"soil_plot", "tree_sapling", "boulder", "fishing_dock",
		"chicken_coop", "campfire", "workshop", "furnace",
		"burner_station", "wheat_mill", "bread_oven", "silo",
		"apple_tree", "pear_tree", "cherry_tree"
	]

	var found: bool = false
	for iid in placeables:
		var count: int = ResourceManager.get_count(iid)
		if count <= 0:
			continue
		found = true
		var info: Dictionary = ResourceManager.get_item_info(iid)
		var row := HBoxContainer.new()
		row.add_theme_constant_override("separation", 10)
		_content.add_child(row)

		var name_lbl := Label.new()
		name_lbl.text = info.get("name", iid)
		name_lbl.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		name_lbl.add_theme_font_size_override("font_size", 11)
		row.add_child(name_lbl)

		var qty_lbl := Label.new()
		qty_lbl.text = "x%d" % count
		qty_lbl.modulate = Color(0.8, 1.0, 0.8)
		qty_lbl.add_theme_font_size_override("font_size", 11)
		row.add_child(qty_lbl)

		var tip := Label.new()
		tip.text = "Drag from Backpack to place on your tile"
		tip.add_theme_font_size_override("font_size", 9)
		tip.modulate = Color(0.5, 0.5, 0.5)
		row.add_child(tip)

	if not found:
		var empty_lbl := Label.new()
		empty_lbl.text = "No placeables in inventory. Buy from NPC shops."
		empty_lbl.add_theme_font_size_override("font_size", 10)
		empty_lbl.modulate = Color(0.6, 0.6, 0.6)
		_content.add_child(empty_lbl)

	_content.add_child(HSeparator.new())

	var deed_lbl := Label.new()
	deed_lbl.text = "Land Deed inventory:"
	deed_lbl.add_theme_font_size_override("font_size", 10)
	deed_lbl.modulate = Color(0.8, 0.8, 0.8)
	_content.add_child(deed_lbl)

	var deed_types: Array = LandManager.TileType.keys()
	var any_deeds: bool = false
	for ts in deed_types:
		var cnt: int = LandManager.deed_inventory.get(ts, 0)
		if cnt > 0:
			any_deeds = true
			var row := HBoxContainer.new()
			_content.add_child(row)
			var lbl := Label.new()
			lbl.text = "%s Deed" % ts.capitalize()
			lbl.size_flags_horizontal = Control.SIZE_EXPAND_FILL
			lbl.add_theme_font_size_override("font_size", 11)
			row.add_child(lbl)
			var clbl := Label.new()
			clbl.text = "x%d" % cnt
			clbl.modulate = Color(0.6, 0.4, 1.0)
			row.add_child(clbl)
	if not any_deeds:
		var no_deed := Label.new()
		no_deed.text = "No deeds. Burn resources at a BurnerStation."
		no_deed.add_theme_font_size_override("font_size", 10)
		no_deed.modulate = Color(0.5, 0.5, 0.5)
		_content.add_child(no_deed)

func _show_onchain_deeds() -> void:
	for c in _content.get_children():
		c.queue_free()

	var info_lbl := Label.new()
	info_lbl.text = "On-chain ERC-1155 Land Deeds"
	info_lbl.add_theme_font_size_override("font_size", 12)
	info_lbl.modulate = Color(0.6, 0.4, 1.0)
	_content.add_child(info_lbl)

	var wallet_lbl := Label.new()
	wallet_lbl.text = "Wallet: " + PlayerData.player_id if PlayerData.player_id != "" else "Wallet: Not connected"
	wallet_lbl.add_theme_font_size_override("font_size", 10)
	wallet_lbl.modulate = Color(0.7, 0.7, 0.7)
	_content.add_child(wallet_lbl)

	var status_lbl := Label.new()
	status_lbl.text = "Chain query not yet connected.\nRainbowKit wallet integration coming soon.\nEarned deeds will appear here once minted on Base."
	status_lbl.add_theme_font_size_override("font_size", 10)
	status_lbl.modulate = Color(0.6, 0.6, 0.6)
	status_lbl.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	_content.add_child(status_lbl)

	var placed_lbl := Label.new()
	placed_lbl.text = "\nPlaced tiles (from LandManager):"
	placed_lbl.add_theme_font_size_override("font_size", 10)
	placed_lbl.modulate = Color(0.8, 0.8, 0.8)
	_content.add_child(placed_lbl)

	var player_tiles: Array = LandManager.get_player_tiles()
	if player_tiles.is_empty():
		var no_tile := Label.new()
		no_tile.text = "No placed tiles found."
		no_tile.add_theme_font_size_override("font_size", 10)
		no_tile.modulate = Color(0.5, 0.5, 0.5)
		_content.add_child(no_tile)
	else:
		for td in player_tiles:
			var row := HBoxContainer.new()
			row.add_theme_constant_override("separation", 10)
			_content.add_child(row)
			var name_lbl := Label.new()
			name_lbl.text = td.get("name", td.get("type_str", "Tile"))
			name_lbl.size_flags_horizontal = Control.SIZE_EXPAND_FILL
			name_lbl.add_theme_font_size_override("font_size", 10)
			row.add_child(name_lbl)
			var pos_lbl := Label.new()
			var p: Vector2i = td.get("position", Vector2i.ZERO)
			pos_lbl.text = "(%d,%d)" % [p.x, p.y]
			pos_lbl.modulate = Color(0.6, 0.6, 0.6)
			pos_lbl.add_theme_font_size_override("font_size", 9)
			row.add_child(pos_lbl)
