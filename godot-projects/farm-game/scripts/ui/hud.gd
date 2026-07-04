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

var _hotbar_items: Array = []

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

	var timer := Timer.new()
	timer.wait_time = 30.0
	timer.autostart = true
	timer.timeout.connect(_on_clock_tick)
	add_child(timer)

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
