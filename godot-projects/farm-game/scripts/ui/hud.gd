extends CanvasLayer

@onready var level_label: Label = $TopLeft/LevelLabel
@onready var xp_bar: ProgressBar = $TopLeft/XPBar
@onready var energy_label: Label = $TopLeft/EnergyLabel
@onready var silver_label: Label = $TopLeft/CurrencyRow/SilverLabel
@onready var gold_label: Label = $TopLeft/CurrencyRow/GoldLabel
@onready var time_label: Label = $TopLeft/TimeLabel
@onready var dau_label: Label = $TopLeft/DauLabel
@onready var hotbar: HBoxContainer = $Bottom/Hotbar
@onready var backpack_btn: Button = $Bottom/Buttons/BackpackBtn
@onready var map_btn: Button = $Bottom/Buttons/MapBtn
@onready var nft_btn: Button = $Bottom/Buttons/NFTBtn
@onready var claim_btn: Button = $Bottom/Buttons/ClaimBtn
@onready var home_btn: Button = $Bottom/Buttons/HomeBtn
@onready var bell_btn: Button = $Bottom/Buttons/BellBtn
@onready var no_energy_label: Label = $NoEnergyLabel

const HOTBAR_SLOTS := 8

const MUSIC_TRACKS := [
	{"name": "Alien Vibes",      "file": "res://assets/audio/music/demon.mp3"},
	{"name": "Space Odyssey",    "file": "res://assets/audio/music/gumbuobeets.mp3"},
	{"name": "UFO Transmission", "file": "res://assets/audio/music/success.mp3"},
	{"name": "Cosmic Energy",    "file": "res://assets/audio/music/arena.mp3"},
	{"name": "Galactic Groove",  "file": "res://assets/audio/music/home.mp3"},
]

const PRESENCE_URL := "https://gamehole.ink/api/presence"

var _hotbar_items: Array = []
var _presence_req: HTTPRequest = null
var _xp_sync_req:  HTTPRequest = null
var _compact_applied: bool = false
var _rotate_overlay: CanvasLayer = null
var _lb_panel: CanvasLayer = null
var _music_player: AudioStreamPlayer = null
var _music_track_index: int = 4  # Galactic Groove default
var _music_expanded: bool = false
var _music_panel: PanelContainer = null
var _music_toggle_btn: Button = null
var _music_track_lbl: Label = null

func _ready() -> void:
	PlayerData.xp_changed.connect(_on_xp_changed)
	PlayerData.energy_changed.connect(_on_energy_changed)
	PlayerData.level_up.connect(_on_level_up)
	ResourceManager.item_added.connect(_on_item_added)
	LandManager.passive_vault_updated.connect(_on_passive_vault_updated)

	_hotbar_items.resize(HOTBAR_SLOTS)
	_hotbar_items.fill("")
	_refresh_all()
	_update_time()
	_update_claim_btn()
	_style_home_btns()
	_refresh_home_btn()
	_add_settings_btn()
	_apply_hud_icons()
	_build_music_player()
	_setup_xp_row()
	LandManager.tile_placed.connect(func(_td): _refresh_home_btn())
	_spawn_activity_log()

	_xp_sync_req = HTTPRequest.new()
	add_child(_xp_sync_req)

	var timer := Timer.new()
	timer.wait_time = 30.0
	timer.autostart = true
	timer.timeout.connect(_on_clock_tick)
	add_child(timer)

	_presence_req = HTTPRequest.new()
	add_child(_presence_req)
	_presence_req.request_completed.connect(_on_presence_response)
	_send_presence_heartbeat()

	var dau_timer := Timer.new()
	dau_timer.wait_time = 120.0
	dau_timer.autostart = true
	dau_timer.timeout.connect(_send_presence_heartbeat)
	add_child(dau_timer)

	get_tree().get_root().size_changed.connect(_on_window_resized)
	call_deferred("_check_mobile")

func _apply_hud_icons() -> void:
	_set_btn_icon(backpack_btn,  "res://assets/sprites/ui/icon_backpack.png")
	_set_btn_icon(map_btn,       "res://assets/sprites/ui/icon_world_map.png")
	var market_btn: Button = get_node_or_null("Bottom/Buttons/MarketBtn")
	if market_btn:
		_set_btn_icon(market_btn, "res://assets/sprites/ui/icon_market.png")
	var currency_row: HBoxContainer = get_node_or_null("TopLeft/CurrencyRow")
	if currency_row:
		_prepend_currency_icon(currency_row, "res://assets/sprites/ui/icon_silver.png", silver_label)
		_prepend_currency_icon(currency_row, "res://assets/sprites/ui/icon_gold.png",   gold_label)

func _set_btn_icon(btn: Button, path: String) -> void:
	if not btn or not ResourceLoader.exists(path): return
	btn.icon = load(path) as Texture2D
	btn.expand_icon = true
	btn.icon_alignment = HORIZONTAL_ALIGNMENT_CENTER
	btn.text = ""

func _prepend_currency_icon(row: HBoxContainer, path: String, before_lbl: Label) -> void:
	if not ResourceLoader.exists(path): return
	var img := TextureRect.new()
	img.texture = load(path) as Texture2D
	img.custom_minimum_size = Vector2(18, 18)
	img.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	img.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
	row.add_child(img)
	row.move_child(img, before_lbl.get_index())

func _setup_xp_row() -> void:
	# Move LevelLabel + XPBar into an HBox so we can squeeze a leaderboard button in
	var top_left: Node = level_label.get_parent()
	if not is_instance_valid(top_left): return
	var insert_idx: int = level_label.get_index()

	var row := HBoxContainer.new()
	row.add_theme_constant_override("separation", 4)
	top_left.add_child(row)
	top_left.move_child(row, insert_idx)

	level_label.reparent(row)
	level_label.add_theme_font_size_override("font_size", 9)

	xp_bar.reparent(row)
	xp_bar.custom_minimum_size = Vector2(70, 12)
	xp_bar.size_flags_horizontal = Control.SIZE_EXPAND_FILL

	var lb_btn := Button.new()
	lb_btn.text = "LB"
	lb_btn.custom_minimum_size = Vector2(26, 18)
	lb_btn.add_theme_font_size_override("font_size", 8)
	var lsb := StyleBoxFlat.new()
	lsb.bg_color     = Color(0.12, 0.10, 0.02, 0.90)
	lsb.border_color = Color(0.9, 0.75, 0.2)
	lsb.set_border_width_all(1)
	lsb.set_corner_radius_all(3)
	lb_btn.add_theme_stylebox_override("normal", lsb)
	lb_btn.add_theme_color_override("font_color", Color(1.0, 0.88, 0.3))
	lb_btn.pressed.connect(_on_lb_btn_pressed)
	row.add_child(lb_btn)

func _on_lb_btn_pressed() -> void:
	if _lb_panel != null and is_instance_valid(_lb_panel):
		_lb_panel.queue_free()
		_lb_panel = null
		return
	var scr: GDScript = load("res://scripts/ui/farm_xp_leaderboard.gd")
	_lb_panel = CanvasLayer.new()
	_lb_panel.set_script(scr)
	get_tree().current_scene.add_child(_lb_panel)
	_lb_panel.tree_exiting.connect(func(): _lb_panel = null)

func _sync_xp_to_server() -> void:
	if _xp_sync_req == null: return
	if _xp_sync_req.get_http_client_status() != HTTPClient.STATUS_DISCONNECTED: return
	var wallet: String = PlayerData.wallet_address
	if wallet == "" or not wallet.begins_with("0x"): return
	var body := JSON.stringify({
		"wallet": wallet.to_lower(),
		"name":   PlayerData.player_name,
		"level":  PlayerData.level,
		"xp":     PlayerData.xp,
	})
	_xp_sync_req.request(
		"https://gamehole.ink/api/farm-xp",
		["Content-Type: application/json"],
		HTTPClient.METHOD_POST,
		body
	)

func _on_item_added(_item_id: String, _amount: int) -> void:
	_pulse_button(backpack_btn, Color(0.4, 1.0, 0.55))

func _on_passive_vault_updated(tile_id: String) -> void:
	var owner: String = LandManager.tiles.get(tile_id, {}).get("owner_id", "")
	if owner == PlayerData.player_id:
		_pulse_button(claim_btn, Color(1.0, 0.88, 0.3))

func _pulse_button(btn: Button, flash_color: Color) -> void:
	if not is_instance_valid(btn): return
	btn.pivot_offset = btn.size / 2.0
	var tw1 := create_tween()
	tw1.tween_property(btn, "scale", Vector2(1.22, 1.22), 0.09)
	tw1.tween_property(btn, "scale", Vector2(1.0, 1.0), 0.28)
	var tw2 := create_tween()
	tw2.tween_property(btn, "modulate", flash_color, 0.09)
	tw2.tween_property(btn, "modulate", Color(1.0, 1.0, 1.0), 0.28)

func _on_clock_tick() -> void:
	_update_time()
	_update_claim_btn()

func _update_time() -> void:
	time_label.text = PlayerData.get_eastern_time_string()

func _send_presence_heartbeat() -> void:
	if _presence_req == null or _presence_req.get_http_client_status() != HTTPClient.STATUS_DISCONNECTED:
		return
	var body := JSON.stringify({"id": PlayerData.player_id})
	_presence_req.request(PRESENCE_URL, ["Content-Type: application/json"], HTTPClient.METHOD_POST, body)
	_sync_xp_to_server()

func _on_presence_response(_result: int, _code: int, _headers: PackedStringArray, body: PackedByteArray) -> void:
	var json := JSON.new()
	if json.parse(body.get_string_from_utf8()) == OK:
		var data = json.get_data()
		if data is Dictionary and data.has("online"):
			dau_label.text = "Online: %d" % int(data["online"])

func _update_claim_btn() -> void:
	if PlayerData.can_claim_daily():
		claim_btn.text = "Claim!"
		claim_btn.disabled = false
		claim_btn.modulate = Color(1.0, 0.88, 0.25)
	else:
		claim_btn.text = "Claimed"
		claim_btn.disabled = true
		claim_btn.modulate = Color(0.7, 0.7, 0.7)

func _on_claim_btn_pressed() -> void:
	var amount := PlayerData.claim_daily()
	update_currency()
	_update_claim_btn()
	var flash := Label.new()
	flash.text = "+%d Silver!" % amount
	flash.add_theme_font_size_override("font_size", 20)
	flash.modulate = Color(1.0, 0.88, 0.25)
	flash.position = Vector2(300, 300)
	add_child(flash)
	await get_tree().create_timer(2.0).timeout
	flash.queue_free()

func _refresh_all() -> void:
	_on_xp_changed(PlayerData.xp, PlayerData.level)
	_on_energy_changed(PlayerData.energy, PlayerData.max_energy)
	silver_label.text = "Silver: %d" % PlayerData.silver
	gold_label.text = "Gold: %g" % PlayerData.gold

func _on_xp_changed(xp: int, level: int) -> void:
	level_label.text = "Lv.%d" % level
	xp_bar.max_value = PlayerData.xp_to_next_level
	xp_bar.value = xp
	xp_bar.tooltip_text = "%d / %d XP" % [xp, PlayerData.xp_to_next_level]

func _on_energy_changed(energy: int, max_energy: int) -> void:
	energy_label.text = "HP %d/%d" % [energy, max_energy]
	energy_label.modulate = Color(1.0, 0.2, 0.2) if energy <= 10 else Color(1.0, 0.35, 0.35)

func _on_level_up(new_level: int) -> void:
	_refresh_all()
	_sync_xp_to_server()

func set_hotbar_item(slot: int, item_id: String) -> void:
	if slot < 0 or slot >= HOTBAR_SLOTS:
		return
	_hotbar_items[slot] = item_id
	_refresh_hotbar()

func _refresh_hotbar() -> void:
	var slots := hotbar.get_children()
	for i in min(slots.size(), HOTBAR_SLOTS):
		var item_id: String = _hotbar_items[i]
		var slot_node: Control = slots[i]
		if item_id == "":
			slot_node.visible = false
		else:
			slot_node.visible = true
			var label: Label = slot_node.get_node_or_null("Label")
			if label:
				var info := ResourceManager.get_item_info(item_id)
				label.text = info.get("name", item_id).substr(0, 4)

func show_no_energy() -> void:
	no_energy_label.visible = true
	await get_tree().create_timer(1.5).timeout
	no_energy_label.visible = false

func _on_window_resized() -> void:
	call_deferred("_check_mobile")

func _check_mobile() -> void:
	var win := DisplayServer.window_get_size()
	if win.x < 10 or win.y < 10:
		return
	if win.y > win.x:
		_ensure_rotate_overlay()
	else:
		_remove_rotate_overlay()
		if win.x < 900 and not _compact_applied:
			_setup_compact_layout()

func _ensure_rotate_overlay() -> void:
	if _rotate_overlay != null:
		return
	_rotate_overlay = CanvasLayer.new()
	_rotate_overlay.layer = 50
	get_tree().current_scene.add_child(_rotate_overlay)
	var bg := ColorRect.new()
	bg.color = Color(0.0, 0.0, 0.0, 0.95)
	bg.set_anchors_preset(Control.PRESET_FULL_RECT)
	_rotate_overlay.add_child(bg)
	var lbl := Label.new()
	lbl.text = "Rotate your device\nto play"
	lbl.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	lbl.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
	lbl.set_anchors_preset(Control.PRESET_FULL_RECT)
	lbl.add_theme_font_size_override("font_size", 28)
	lbl.modulate = Color(0.6, 1.0, 0.7)
	_rotate_overlay.add_child(lbl)

func _remove_rotate_overlay() -> void:
	if _rotate_overlay != null and is_instance_valid(_rotate_overlay):
		_rotate_overlay.queue_free()
	_rotate_overlay = null

func _setup_compact_layout() -> void:
	_compact_applied = true
	var compact := Vector2(38, 44)
	# Shrink all buttons in the Buttons row
	var buttons_row := get_node_or_null("Bottom/Buttons")
	if buttons_row:
		for child in buttons_row.get_children():
			if child is Button:
				child.custom_minimum_size = compact
	# Shrink hotbar slots
	for slot in hotbar.get_children():
		slot.custom_minimum_size = compact
	# Shrink music toggle
	if _music_toggle_btn:
		_music_toggle_btn.custom_minimum_size = Vector2(34, 44)
	# Hide NFT (least essential on mobile)
	if nft_btn:
		nft_btn.visible = false

var _activity_log: Node = null

func _spawn_activity_log() -> void:
	_activity_log = Node.new()
	_activity_log.set_script(load("res://scripts/ui/activity_log.gd"))
	add_child(_activity_log)

var _backpack: CanvasLayer = null
var _nft_panel: CanvasLayer = null
var _market: CanvasLayer = null
var _credits: Control = null
var _tile_settings: CanvasLayer = null
var _tile_chooser: CanvasLayer = null

func _toggle_panel(field_name: String, script_path: String) -> void:
	var current: CanvasLayer = get(field_name)
	if current != null and is_instance_valid(current):
		current.queue_free()
		set(field_name, null)
		return
	var scr: GDScript = load(script_path)
	var panel: CanvasLayer = CanvasLayer.new()
	panel.set_script(scr)
	panel.layer = 25
	get_tree().current_scene.add_child(panel)
	set(field_name, panel)

func _on_backpack_btn_pressed() -> void:
	_toggle_panel("_backpack", "res://scripts/ui/backpack_ui.gd")

func _on_market_btn_pressed() -> void:
	_toggle_panel("_market", "res://scripts/ui/market_ui.gd")

func _style_home_btns() -> void:
	# Home button — green tint
	if home_btn:
		home_btn.add_theme_font_size_override("font_size", 9)
		var hsb := StyleBoxFlat.new()
		hsb.bg_color     = Color(0.12, 0.26, 0.10, 0.92)
		hsb.border_color = Color(0.40, 0.85, 0.30)
		hsb.set_border_width_all(1)
		hsb.set_corner_radius_all(4)
		home_btn.add_theme_stylebox_override("normal", hsb)
		home_btn.add_theme_color_override("font_color", Color(0.55, 1.0, 0.40))
	# Bell button — gold tint
	if bell_btn:
		bell_btn.add_theme_font_size_override("font_size", 9)
		var bsb := StyleBoxFlat.new()
		bsb.bg_color     = Color(0.18, 0.14, 0.06, 0.92)
		bsb.border_color = Color(0.90, 0.75, 0.20)
		bsb.set_border_width_all(1)
		bsb.set_corner_radius_all(4)
		bell_btn.add_theme_stylebox_override("normal", bsb)
		bell_btn.add_theme_color_override("font_color", Color(1.0, 0.88, 0.30))

func _refresh_home_btn() -> void:
	if home_btn:
		var has_tiles: bool = not LandManager.get_player_tiles().is_empty()
		home_btn.disabled = not has_tiles
		home_btn.modulate = Color(1, 1, 1, 1) if has_tiles else Color(0.5, 0.5, 0.5, 0.7)

func _on_home_btn_pressed() -> void:
	if _tile_chooser != null and is_instance_valid(_tile_chooser):
		_tile_chooser.queue_free()
		_tile_chooser = null
		return
	_open_tile_chooser()

func _open_tile_chooser() -> void:
	_tile_chooser = CanvasLayer.new()
	_tile_chooser.layer = 30
	get_tree().current_scene.add_child(_tile_chooser)

	var overlay := ColorRect.new()
	overlay.set_anchors_preset(Control.PRESET_FULL_RECT)
	overlay.color = Color(0, 0, 0, 0.50)
	overlay.mouse_filter = Control.MOUSE_FILTER_STOP
	overlay.gui_input.connect(func(ev: InputEvent) -> void:
		if ev is InputEventMouseButton and ev.pressed:
			if is_instance_valid(_tile_chooser): _tile_chooser.queue_free()
			_tile_chooser = null
	)
	_tile_chooser.add_child(overlay)

	var panel := PanelContainer.new()
	var psb := StyleBoxFlat.new()
	psb.bg_color = Color(0.06, 0.09, 0.06, 0.97)
	psb.border_color = Color(0.35, 0.70, 0.25)
	psb.set_border_width_all(2)
	psb.set_corner_radius_all(8)
	panel.add_theme_stylebox_override("panel", psb)
	panel.custom_minimum_size = Vector2(420, 300)
	panel.set_anchors_preset(Control.PRESET_CENTER)
	panel.offset_left   = -210.0
	panel.offset_right  =  210.0
	panel.offset_top    = -150.0
	panel.offset_bottom =  150.0
	panel.mouse_filter = Control.MOUSE_FILTER_STOP
	_tile_chooser.add_child(panel)

	var vbox := VBoxContainer.new()
	vbox.add_theme_constant_override("separation", 6)
	panel.add_child(vbox)

	# Header row
	var hdr := HBoxContainer.new()
	vbox.add_child(hdr)
	var title := Label.new()
	title.text = "YOUR TILES"
	title.add_theme_font_size_override("font_size", 15)
	title.modulate = Color(0.55, 1.0, 0.40)
	title.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	hdr.add_child(title)
	var close_btn := Button.new()
	close_btn.text = "X"
	close_btn.custom_minimum_size = Vector2(28, 28)
	close_btn.pressed.connect(func():
		if is_instance_valid(_tile_chooser): _tile_chooser.queue_free()
		_tile_chooser = null
	)
	hdr.add_child(close_btn)
	vbox.add_child(HSeparator.new())

	# Scrollable tile list
	var scroll := ScrollContainer.new()
	scroll.size_flags_vertical = Control.SIZE_EXPAND_FILL
	scroll.horizontal_scroll_mode = ScrollContainer.SCROLL_MODE_DISABLED
	vbox.add_child(scroll)

	var list := VBoxContainer.new()
	list.add_theme_constant_override("separation", 4)
	list.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	scroll.add_child(list)

	var player_tiles: Array = LandManager.get_player_tiles()
	if player_tiles.is_empty():
		var empty := Label.new()
		empty.text = "No tiles placed yet.\nVisit the World Map to place your first tile."
		empty.modulate = Color(0.6, 0.6, 0.6)
		empty.add_theme_font_size_override("font_size", 11)
		empty.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
		list.add_child(empty)
	else:
		var TYPE_COLORS: Dictionary = {
			"FARM":     Color(0.22, 0.52, 0.18, 0.6),
			"FOREST":   Color(0.12, 0.35, 0.12, 0.6),
			"MOUNTAIN": Color(0.40, 0.32, 0.22, 0.6),
			"POND":     Color(0.15, 0.30, 0.55, 0.6),
		}
		for tile in player_tiles:
			var tid: String     = tile.get("id", "")
			var ttype: int      = tile.get("type", 0)
			var ttype_str: String = tile.get("type_str", "")
			var tname: String   = tile.get("name", ttype_str.capitalize())
			var is_home: bool   = tid == LandManager.home_tile_id
			var is_cur: bool    = tid == LandManager.current_tile_id

			var row := Button.new()
			var rsb := StyleBoxFlat.new()
			rsb.bg_color = TYPE_COLORS.get(ttype_str, Color(0.25, 0.25, 0.25, 0.6))
			if is_cur: rsb.bg_color.a = 0.25
			rsb.set_corner_radius_all(4)
			rsb.content_margin_left  = 10.0
			rsb.content_margin_right = 10.0
			rsb.content_margin_top   = 5.0
			rsb.content_margin_bottom = 5.0
			row.add_theme_stylebox_override("normal", rsb)
			row.alignment = HORIZONTAL_ALIGNMENT_LEFT
			row.custom_minimum_size = Vector2(0, 42)
			var star: String = "★ " if is_home else "     "
			var cur_tag: String = "  [HERE]" if is_cur else ""
			row.text = "%s%s    (%s)%s" % [star, tname, ttype_str.capitalize(), cur_tag]
			row.add_theme_font_size_override("font_size", 12)
			row.disabled = is_cur
			if not is_cur:
				var cap_tid := tid
				var cap_type := ttype
				row.pressed.connect(func(): _travel_to_tile(cap_tid, cap_type))
			list.add_child(row)

	vbox.add_child(HSeparator.new())
	var hint := Label.new()
	hint.text = "★ = home tile     click any row to fast-travel"
	hint.add_theme_font_size_override("font_size", 9)
	hint.modulate = Color(0.50, 0.50, 0.50)
	hint.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	vbox.add_child(hint)

func _travel_to_tile(tile_id: String, tile_type: int) -> void:
	if is_instance_valid(_tile_chooser):
		_tile_chooser.queue_free()
	_tile_chooser = null
	var scene_path: String = _tile_type_to_scene(tile_type)
	if scene_path == "":
		return
	PlayerData.save_data()
	ResourceManager.save_inventory()
	LandManager.save_land_data()
	LandManager.current_tile_id = tile_id
	get_tree().change_scene_to_file(scene_path)

func _on_bell_btn_pressed() -> void:
	if _activity_log != null and is_instance_valid(_activity_log):
		_activity_log.toggle_history()

func _tile_type_to_scene(tile_type: int) -> String:
	match tile_type:
		LandManager.TileType.FARM:     return "res://scenes/tiles/FarmTile.tscn"
		LandManager.TileType.FOREST:   return "res://scenes/tiles/ForestTile.tscn"
		LandManager.TileType.MOUNTAIN: return "res://scenes/tiles/MountainTile.tscn"
		LandManager.TileType.POND:     return "res://scenes/tiles/PondTile.tscn"
	return ""

func _add_settings_btn() -> void:
	var buttons_row: Node = get_node_or_null("Bottom/Buttons")
	if not buttons_row:
		return
	var btn := Button.new()
	btn.text = "Tile"
	btn.custom_minimum_size = Vector2(56, 32)
	btn.add_theme_font_size_override("font_size", 10)
	btn.pressed.connect(_on_settings_btn_pressed)
	buttons_row.add_child(btn)

	var logout_btn := Button.new()
	logout_btn.text = "Logout"
	logout_btn.custom_minimum_size = Vector2(56, 32)
	logout_btn.add_theme_font_size_override("font_size", 10)
	var sb := StyleBoxFlat.new()
	sb.bg_color = Color(0.35, 0.10, 0.10, 0.90)
	sb.border_color = Color(0.70, 0.20, 0.20)
	sb.set_border_width_all(1)
	sb.set_corner_radius_all(4)
	logout_btn.add_theme_stylebox_override("normal", sb)
	logout_btn.add_theme_color_override("font_color", Color(1.0, 0.6, 0.6))
	logout_btn.pressed.connect(_on_logout_pressed)
	buttons_row.add_child(logout_btn)

func _on_logout_pressed() -> void:
	PlayerData.logout()
	get_tree().change_scene_to_file("res://scenes/ui/StartScreen.tscn")

func _on_map_btn_pressed() -> void:
	get_tree().change_scene_to_file("res://scenes/world_map/WorldMap.tscn")

func _on_nft_btn_pressed() -> void:
	_toggle_panel("_nft_panel", "res://scripts/ui/nft_panel.gd")

func _on_settings_btn_pressed() -> void:
	var tid: String = LandManager.current_tile_id
	if tid == "":
		return
	if _tile_settings != null and is_instance_valid(_tile_settings):
		_tile_settings.queue_free()
		_tile_settings = null
		return
	var scr: GDScript = load("res://scripts/ui/tile_settings_ui.gd")
	_tile_settings = CanvasLayer.new()
	_tile_settings.set_script(scr)
	_tile_settings.layer = 25
	get_tree().current_scene.add_child(_tile_settings)
	_tile_settings.open(tid)
	_tile_settings.tree_exiting.connect(func(): _tile_settings = null)

func update_currency() -> void:
	silver_label.text = "Silver: %d" % PlayerData.silver
	gold_label.text = "Gold: %g" % PlayerData.gold

func show_credits() -> void:
	if _credits != null and is_instance_valid(_credits):
		return
	var credits_scene: PackedScene = load("res://scenes/ui/Credits.tscn")
	_credits = credits_scene.instantiate()
	_credits.closed.connect(func(): _credits = null)
	add_child(_credits)

# ── Music Player ─────────────────────────────────────────────────────────────

func _build_music_player() -> void:
	_music_player = AudioStreamPlayer.new()
	_music_player.bus = "Master"
	add_child(_music_player)
	_music_player.finished.connect(_on_music_finished)
	_load_track(_music_track_index)

	# Toggle button — inserted as first item in the bottom buttons bar
	_music_toggle_btn = Button.new()
	_music_toggle_btn.text = "MUS"
	_music_toggle_btn.flat = false
	_music_toggle_btn.custom_minimum_size = Vector2(46, 32)
	_music_toggle_btn.add_theme_font_size_override("font_size", 10)
	var tsb := StyleBoxFlat.new()
	tsb.bg_color = Color(0.07, 0.07, 0.15, 0.92)
	tsb.border_color = Color(0.0, 0.83, 1.0)
	tsb.set_border_width_all(2)
	tsb.set_corner_radius_all(4)
	_music_toggle_btn.add_theme_stylebox_override("normal", tsb)
	_music_toggle_btn.add_theme_color_override("font_color", Color(0.0, 0.83, 1.0))
	_music_toggle_btn.pressed.connect(_on_music_toggle)
	var bottom_row: Node = get_node_or_null("Bottom")
	if bottom_row:
		bottom_row.add_child(_music_toggle_btn)
		bottom_row.move_child(_music_toggle_btn, 0)
	else:
		_music_toggle_btn.position = Vector2(14, 720 - 60)
		add_child(_music_toggle_btn)

	# Expanded panel (hidden initially)
	_music_panel = PanelContainer.new()
	var psb := StyleBoxFlat.new()
	psb.bg_color = Color(0.07, 0.07, 0.15, 0.95)
	psb.border_color = Color(0.0, 0.83, 1.0)
	psb.set_border_width_all(2)
	psb.set_corner_radius_all(10)
	_music_panel.add_theme_stylebox_override("panel", psb)
	_music_panel.position = Vector2(14, 720 - 200)
	_music_panel.visible = false
	add_child(_music_panel)

	var vbox := VBoxContainer.new()
	vbox.add_theme_constant_override("separation", 6)
	vbox.custom_minimum_size = Vector2(240, 0)
	_music_panel.add_child(vbox)

	# Header row
	var hdr := HBoxContainer.new()
	vbox.add_child(hdr)
	var hdr_lbl := Label.new()
	hdr_lbl.text = "MUSIC PLAYER"
	hdr_lbl.add_theme_font_size_override("font_size", 10)
	hdr_lbl.modulate = Color(0.0, 0.83, 1.0)
	hdr_lbl.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	hdr.add_child(hdr_lbl)
	var close_btn := Button.new()
	close_btn.text = "X"
	close_btn.flat = true
	close_btn.add_theme_font_size_override("font_size", 16)
	close_btn.modulate = Color(0.6, 0.6, 0.6)
	close_btn.pressed.connect(_on_music_toggle)
	hdr.add_child(close_btn)

	# Track name
	_music_track_lbl = Label.new()
	_music_track_lbl.text = MUSIC_TRACKS[_music_track_index]["name"]
	_music_track_lbl.add_theme_font_size_override("font_size", 12)
	_music_track_lbl.modulate = Color(0.2, 1.0, 0.6)
	_music_track_lbl.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	vbox.add_child(_music_track_lbl)

	# Controls row
	var ctrl := HBoxContainer.new()
	ctrl.alignment = BoxContainer.ALIGNMENT_CENTER
	ctrl.add_theme_constant_override("separation", 8)
	vbox.add_child(ctrl)

	var prev_btn := Button.new()
	prev_btn.text = "|<"
	prev_btn.custom_minimum_size = Vector2(34, 34)
	prev_btn.add_theme_font_size_override("font_size", 14)
	_style_music_ctrl_btn(prev_btn, false)
	prev_btn.pressed.connect(_on_music_prev)
	ctrl.add_child(prev_btn)

	var play_btn := Button.new()
	play_btn.text = ">"
	play_btn.name = "PlayBtn"
	play_btn.custom_minimum_size = Vector2(46, 46)
	play_btn.add_theme_font_size_override("font_size", 18)
	_style_music_ctrl_btn(play_btn, true)
	play_btn.pressed.connect(_on_music_play_pause)
	ctrl.add_child(play_btn)

	var next_btn := Button.new()
	next_btn.text = ">|"
	next_btn.custom_minimum_size = Vector2(34, 34)
	next_btn.add_theme_font_size_override("font_size", 14)
	_style_music_ctrl_btn(next_btn, false)
	next_btn.pressed.connect(_on_music_next)
	ctrl.add_child(next_btn)

	# Track selector
	var opt := OptionButton.new()
	opt.name = "TrackSelect"
	opt.add_theme_font_size_override("font_size", 10)
	for i in MUSIC_TRACKS.size():
		opt.add_item(MUSIC_TRACKS[i]["name"], i)
	opt.select(_music_track_index)
	opt.item_selected.connect(func(idx: int) -> void:
		_music_track_index = idx
		_load_track(idx)
		if _music_player.playing:
			_music_player.play()
		if _music_track_lbl:
			_music_track_lbl.text = MUSIC_TRACKS[idx]["name"]
	)
	vbox.add_child(opt)

func _style_music_ctrl_btn(btn: Button, is_play: bool) -> void:
	var sb := StyleBoxFlat.new()
	sb.bg_color = Color(0.0, 0.83, 1.0, 0.15) if not is_play else Color(0.2, 1.0, 0.6, 0.9)
	sb.border_color = Color(0.0, 0.83, 1.0)
	sb.set_border_width_all(1)
	sb.set_corner_radius_all(23 if is_play else 6)
	btn.add_theme_stylebox_override("normal", sb)
	if is_play:
		btn.modulate = Color(0.0, 0.0, 0.0)

func _load_track(idx: int) -> void:
	var path: String = MUSIC_TRACKS[idx]["file"]
	if ResourceLoader.exists(path):
		_music_player.stream = load(path) as AudioStream
		_music_player.stop()

func _on_music_toggle() -> void:
	_music_expanded = not _music_expanded
	_music_panel.visible = _music_expanded
	_music_toggle_btn.text = "MUS"

func _on_music_play_pause() -> void:
	if _music_player.playing:
		_music_player.stop()
		_music_toggle_btn.text = "MUS"
	else:
		_music_player.play()
		_music_toggle_btn.text = "🎵"
	_update_play_btn()

func _on_music_prev() -> void:
	_music_track_index = (_music_track_index - 1 + MUSIC_TRACKS.size()) % MUSIC_TRACKS.size()
	_load_track(_music_track_index)
	if _music_track_lbl:
		_music_track_lbl.text = MUSIC_TRACKS[_music_track_index]["name"]
	var opt: OptionButton = _music_panel.get_node_or_null("VBoxContainer/TrackSelect")
	if opt: opt.select(_music_track_index)
	if _music_player.stream:
		_music_player.play()

func _on_music_next() -> void:
	_music_track_index = (_music_track_index + 1) % MUSIC_TRACKS.size()
	_load_track(_music_track_index)
	if _music_track_lbl:
		_music_track_lbl.text = MUSIC_TRACKS[_music_track_index]["name"]
	var opt: OptionButton = _music_panel.get_node_or_null("VBoxContainer/TrackSelect")
	if opt: opt.select(_music_track_index)
	if _music_player.stream:
		_music_player.play()

func _on_music_finished() -> void:
	_on_music_next()

func _update_play_btn() -> void:
	var btn: Button = _music_panel.get_node_or_null("VBoxContainer/HBoxContainer2/PlayBtn") if _music_panel else null
	if btn:
		btn.text = "||" if _music_player.playing else ">"
