extends Node

signal inventory_changed(item_id: String, new_count: int)
signal item_added(item_id: String, amount: int)

# All in-game items stored as { item_id: count }
var inventory: Dictionary = {}

const SAVE_PATH := "user://resources.cfg"

# Item definitions loaded from data/items.json
var item_data: Dictionary = {}

func _ready() -> void:
	_load_item_data()
	load_inventory()

func add_item(item_id: String, amount: int = 1) -> void:
	inventory[item_id] = inventory.get(item_id, 0) + amount
	item_added.emit(item_id, amount)
	inventory_changed.emit(item_id, inventory[item_id])

func remove_item(item_id: String, amount: int = 1) -> bool:
	if inventory.get(item_id, 0) < amount:
		return false
	inventory[item_id] -= amount
	if inventory[item_id] <= 0:
		inventory.erase(item_id)
	inventory_changed.emit(item_id, inventory.get(item_id, 0))
	return true

func has_item(item_id: String, amount: int = 1) -> bool:
	return inventory.get(item_id, 0) >= amount

func get_count(item_id: String) -> int:
	return inventory.get(item_id, 0)

func get_item_info(item_id: String) -> Dictionary:
	return item_data.get(item_id, {
		"id": item_id,
		"name": item_id.capitalize(),
		"category": "misc",
		"description": "",
		"sell_price_silver": 1,
		"sell_price_gold": 0,
		"energy_restore": 0
	})

func get_items_by_category(category: String) -> Array:
	var result: Array = []
	for item_id in inventory:
		var info := get_item_info(item_id)
		if info.get("category", "") == category:
			result.append({ "id": item_id, "count": inventory[item_id], "info": info })
	return result

func eat_food(item_id: String) -> bool:
	var info := get_item_info(item_id)
	var restore: int = info.get("energy_restore", 0)
	if restore <= 0:
		return false
	if not remove_item(item_id):
		return false
	PlayerData.restore_energy(restore)
	return true

func _load_item_data() -> void:
	var path := "res://data/items.json"
	if not FileAccess.file_exists(path):
		return
	var file := FileAccess.open(path, FileAccess.READ)
	var json := JSON.new()
	if json.parse(file.get_as_text()) == OK:
		var parsed = json.get_data()
		if parsed is Array:
			for entry in parsed:
				item_data[entry["id"]] = entry

func save_inventory() -> void:
	var cfg := ConfigFile.new()
	cfg.set_value("inventory", "data", var_to_str(inventory))
	cfg.save(SAVE_PATH)

func load_inventory() -> void:
	var cfg := ConfigFile.new()
	if cfg.load(SAVE_PATH) != OK:
		_grant_starter_items()
		return
	inventory = str_to_var(cfg.get_value("inventory", "data", "{}"))
	if inventory.is_empty():
		_grant_starter_items()
	else:
		inventory.erase("_dev_starter")
		inventory.erase("egg")   # plain egg obsolete — only egg_white / egg_gold exist now
		var dirty := false
		if inventory.get("soil_plot", 0) < 100:
			inventory["soil_plot"] = 100
			dirty = true
		if not inventory.has("mailbox"):
			inventory["mailbox"] = 1
			dirty = true
		# flag stored in cfg meta section, NOT in inventory dict, to avoid type errors
		if not cfg.get_value("meta", "dev_starter", false):
			cfg.set_value("meta", "dev_starter", true)
			var _dev_items := [
				"wood","stone","clay","iron_ore","iron_ingot",
				"silver_ore","gold_ore","amethyst","ruby","emerald","sapphire",
				"silver_ingot","gold_ingot","clay_brick","stone_brick",
				"wood_plank","cotton_thread","cotton_thread_blue","cotton_thread_brown",
				"cotton_thread_green","cotton_thread_orange","cotton_thread_red","cotton_thread_yellow",
				"grape_must","honey","chicken_feed",
				"wheat","wheat_flour","carrot","pumpkin","red_flower","yellow_flower",
				"blue_flower","cotton","grapes","tomato","fern","cucumber","potato",
				"red_rose","pink_rose","dark_red_rose","yellow_rose","white_rose","beige_rose",
				"egg","mushroom","apple","pear","peach","lemon",
				"tadpole","grey_chubfish","yellow_chubfish","red_chubfish",
				"catfish","black_crappie","orange_bluegill","blue_bluegill","yellow_bluegill",
				"crucian_carp","lotus_carp","albino_catfish","golden_koi",
				"bread","wine","wrapped_potato","french_fries","veggie_salad",
				"fruit_salad","mushroom_soup","tomato_omelette","mushroom_omelette",
				"pumpkin_bread","carrot_cake","golden_potato_cake","upside_down_tomato_cake",
				"pumpkin_spice_cake","grape_tart_cake","combat_health_potion","combat_stamina_potion",
				"purple_potion","red_potion",
				"tool_axe_iron","tool_axe_silver","tool_axe_gold",
				"tool_pickaxe_iron","tool_pickaxe_silver","tool_pickaxe_gold",
				"tool_rod_basic","tool_rod_iron","tool_rod_silver","tool_rod_gold",
				"seed_wheat","seed_carrot","seed_pumpkin","seed_red_flower","seed_yellow_flower",
				"seed_blue_flower","seed_cotton","seed_grapes","seed_tomato","seed_fern",
				"seed_cucumber","seed_potato","seed_roses",
				"tree","apple_tree","pear_tree","peach_tree","lemon_tree","boulder",
				"workbench","soil_plot","alchemy_table","anvil","barrel","beehive","bonfire",
				"box","dyeing_vat","sawmill","spinning_wheel","stonecutter","wine_press",
				"recipe_soil_plot","recipe_hoe","recipe_watering_can","recipe_axe","recipe_pickaxe",
				"recipe_fishing_rod","recipe_peach_jam","recipe_wrapped_potato","recipe_french_fries",
				"recipe_veggie_salad","recipe_mushroom_soup","recipe_tomato_omelette",
				"recipe_mushroom_omelette","recipe_pumpkin_bread","recipe_carrot_cake",
				"recipe_golden_potato_cake","recipe_upside_down_tomato_cake","recipe_pumpkin_spice_cake",
				"recipe_grape_tart_cake","recipe_combat_health_potion","recipe_combat_stamina_potion",
				"recipe_chicken_feed",
				"wood_flamingo","valentines_stone_bench","arch_blue_flowers","arch_red_flowers",
				"arch_yellow_flowers","simple_arch","bench","small_bench","big_bench",
				"carpet_brown","carpet_green","carpet_orange","carpet_red","compost","fountain",
				"lights","pillow_green","pillow_grey","pillow_orange","pillow_red","pillow_yellow",
				"pillows","round_plants_pot","square_plants_pot","sleigh","sundial",
				"tiny_brown_tent","tiny_white_tent","wood_sign","wood_table"
			]
			for iid in _dev_items:
				inventory[iid] = max(inventory.get(iid, 0), 1000)
			PlayerData.add_gold(1000.0)
			PlayerData.add_silver(10000)
			PlayerData.restore_energy(PlayerData.max_energy)
			PlayerData.save_data()
			cfg.set_value("inventory", "data", var_to_str(inventory))
			cfg.save(SAVE_PATH)
		if not cfg.get_value("meta", "dev_v2", false):
			cfg.set_value("meta", "dev_v2", true)
			inventory["egg_white"] = max(inventory.get("egg_white", 0), 1000)
			inventory["egg_gold"]  = max(inventory.get("egg_gold",  0), 1000)
			cfg.set_value("inventory", "data", var_to_str(inventory))
			cfg.save(SAVE_PATH)
		if not cfg.get_value("meta", "dev_v3", false):
			cfg.set_value("meta", "dev_v3", true)
			inventory["chicken_coop"] = max(inventory.get("chicken_coop", 0), 1000)
			inventory["egg_white"]    = max(inventory.get("egg_white",    0), 1000)
			inventory["egg_gold"]     = max(inventory.get("egg_gold",     0), 1000)
			inventory.erase("egg")  # plain egg replaced by egg_white / egg_gold
			cfg.set_value("inventory", "data", var_to_str(inventory))
			cfg.save(SAVE_PATH)
		if dirty:
			save_inventory()

func _grant_starter_items() -> void:
	inventory["workbench"] = 1
	inventory["soil_plot"] = 100
	inventory["mailbox"] = 1
	inventory["seed_wheat"] = 5
	inventory["seed_carrot"] = 3
	inventory["seed_potato"] = 3
	save_inventory()
