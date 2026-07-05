extends CanvasLayer

@onready var level_label: Label = $TopLeft/LevelLabel
@onready var xp_bar: ProgressBar = $TopLeft/XPBar
@onready var energy_bar: ProgressBar = $TopLeft/EnergyBar
@onready var energy_label: Label = $TopLeft/EnergyLabel
@onready var silver_label: Label = $TopLeft/CurrencyRow/SilverLabel
@onready var gold_label: Label = $TopLeft/CurrencyRow/GoldLabel
@onready var time_label: Label = $TopLeft/TimeLabel
@onready var hotbar: HBoxContainer = $Bottom/Hotbar
@onready var backpack_btn: Button = $Bottom/Buttons/BackpackBtn
@onready var map_btn: Button = $Bottom/Buttons/MapBtn
@onready var nft_btn: Button = $Bottom/Buttons/NFTBtn
@onready var claim_btn: Button = $Bottom/Buttons/ClaimBtn
@onready var npc_strip: VBoxContainer = $NPCStrip
@onready var no_energy_label: Label = $NoEnergyLabel

const HOTBAR_SLOTS := 8

const MUSIC_TRACKS := [
	{"name": "Alien Vibes",      "file": "res://assets/audio/music/demon.mp3"},
	{"name": "Space Odyssey",    "file": "res://assets/audio/music/gumbuobeets.mp3"},
	{"name": "UFO Transmission", "file": "res://assets/audio/music/success.mp3"},
	{"name": "Cosmic Energy",    "file": "res://assets/audio/music/arena.mp3"},
	{"name": "Galactic Groove",  "file": "res://assets/audio/music/home.mp3"},
]

var _hotbar_items: Array = []
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
	NPCManager.npc_discovered.connect(_on_npc_discovered)

	_hotbar_items.resize(HOTBAR_SLOTS)
	_hotbar_items.fill("")
	_refresh_all()
	_build_npc_strip()
	_update_time()
	_update_claim_btn()
	_add_settings_btn()
	_apply_hud_icons()
	_build_music_player()

	var timer := Timer.new()
	timer.wait_time = 30.0
	timer.autostart = true
	timer.timeout.connect(_on_clock_tick)
	add_child(timer)

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

func _on_clock_tick() -> void:
	_update_time()
	_update_claim_btn()

func _update_time() -> void:
	time_label.text = PlayerData.get_eastern_time_string()

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
	energy_bar.max_value = max_energy
	energy_bar.value = energy
	energy_label.text = "%d/%d" % [energy, max_energy]
	if energy <= 10:
		energy_bar.modulate = Color.RED
	else:
		energy_bar.modulate = Color.WHITE

func _on_level_up(new_level: int) -> void:
	_refresh_all()

func _build_npc_strip() -> void:
	for child in npc_strip.get_children():
		child.queue_free()
	for npc in NPCManager.get_all_npcs_for_hud():
		var btn := Button.new()
		btn.custom_minimum_size = Vector2(48, 48)
		btn.tooltip_text = npc.get("shop_name", npc["name"])
		btn.pressed.connect(_on_visit_npc.bind(npc["id"]))
		var portrait_path: String = npc.get("portrait", "")
		if portrait_path != "" and ResourceLoader.exists(portrait_path):
			btn.icon = load(portrait_path) as Texture2D
			btn.expand_icon = true
			btn.text = ""
		else:
			btn.text = npc["name"].substr(0, 2)
		npc_strip.add_child(btn)

func _on_npc_discovered(_npc_id: String) -> void:
	_build_npc_strip()

func _on_visit_npc(npc_id: String) -> void:
	PlayerData.save_data()
	ResourceManager.save_inventory()
	LandManager.save_land_data()
	LandManager.current_tile_id = "npc_" + npc_id
	get_tree().change_scene_to_file("res://scenes/tiles/NPCTile.tscn")

func set_hotbar_item(slot: int, item_id: String) -> void:
	if slot < 0 or slot >= HOTBAR_SLOTS:
		return
	_hotbar_items[slot] = item_id
	_refresh_hotbar()

func _refresh_hotbar() -> void:
	var slots := hotbar.get_children()
	for i in min(slots.size(), HOTBAR_SLOTS):
		var item_id: String = _hotbar_items[i]
		var label: Label = slots[i].get_node_or_null("Label")
		if label:
			if item_id == "":
				label.text = ""
			else:
				var info := ResourceManager.get_item_info(item_id)
				label.text = info.get("name", item_id).substr(0, 4)

func show_no_energy() -> void:
	no_energy_label.visible = true
	await get_tree().create_timer(1.5).timeout
	no_energy_label.visible = false

var _backpack: CanvasLayer = null
var _nft_panel: CanvasLayer = null
var _market: CanvasLayer = null
var _credits: Control = null
var _tile_settings: CanvasLayer = null

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

func _add_settings_btn() -> void:
	var buttons_row: Node = get_node_or_null("Bottom/Buttons")
	if not buttons_row:
		return
	var btn := Button.new()
	btn.text = "⚙ Tile"
	btn.custom_minimum_size = Vector2(56, 32)
	btn.add_theme_font_size_override("font_size", 10)
	btn.pressed.connect(_on_settings_btn_pressed)
	buttons_row.add_child(btn)

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

	# Collapsed toggle button — bottom-left
	_music_toggle_btn = Button.new()
	_music_toggle_btn.text = "MUS"
	_music_toggle_btn.flat = false
	_music_toggle_btn.custom_minimum_size = Vector2(46, 46)
	_music_toggle_btn.position = Vector2(14, 720 - 60)
	_music_toggle_btn.add_theme_font_size_override("font_size", 22)
	var tsb := StyleBoxFlat.new()
	tsb.bg_color = Color(0.07, 0.07, 0.15, 0.92)
	tsb.border_color = Color(0.0, 0.83, 1.0)
	tsb.set_border_width_all(2)
	tsb.set_corner_radius_all(23)
	_music_toggle_btn.add_theme_stylebox_override("normal", tsb)
	_music_toggle_btn.pressed.connect(_on_music_toggle)
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
