extends Node

signal npc_discovered(npc_id: String)

var discovered_npcs: Dictionary = {}

var npcs: Dictionary = {
	"frog_ricefarmer": {
		"id": "frog_ricefarmer",
		"name": "Frog Lilly",
		"shop_name": "Frog Lilly's Seed Stall",
		"description": "A cheerful frog farmer who grows rice and trades seeds from across the land.",
		"npc_tile_type": "FARM",
		"map_position": Vector2i(1, 4),
		"color": [0.22, 0.68, 0.28],
		"sprite":   "res://assets/sprites/npcs/frog_ricefarmer.png",
		"portrait": "res://assets/sprites/npcs/frog_ricefarmer_portrait.png",
		"inventory": [
			{"item_id": "seed_wheat",        "price_silver": 1},
			{"item_id": "seed_carrot",       "price_silver": 1},
			{"item_id": "seed_pumpkin",      "price_silver": 1},
			{"item_id": "seed_potato",       "price_silver": 1},
			{"item_id": "seed_tomato",       "price_silver": 1},
			{"item_id": "seed_cucumber",     "price_silver": 1},
			{"item_id": "seed_cotton",       "price_silver": 1},
			{"item_id": "seed_grapes",       "price_silver": 1},
			{"item_id": "seed_fern",         "price_silver": 1},
			{"item_id": "seed_red_flower",   "price_silver": 1},
			{"item_id": "seed_yellow_flower","price_silver": 1},
			{"item_id": "seed_blue_flower",  "price_silver": 1},
			{"item_id": "seed_roses", "price_silver": 0, "price_gold": 0.1},
		]
	},
	"cat_fisherman": {
		"id": "cat_fisherman",
		"name": "Tomcat",
		"shop_name": "Tomcat's Fishing Shack",
		"description": "A seasoned cat fisherman who knows every fish in the pond — and has supplies to prove it.",
		"npc_tile_type": "POND",
		"map_position": Vector2i(8, 4),
		"color": [0.88, 0.58, 0.22],
		"sprite":   "res://assets/sprites/npcs/cat_fisherman.png",
		"portrait": "res://assets/sprites/npcs/cat_fisherman_portrait.png",
		"inventory": [
			{"item_id": "tool_rod_basic",  "price_silver": 20},
			{"item_id": "apple_tree",      "price_silver": 8},
			{"item_id": "pear_tree",       "price_silver": 8},
			{"item_id": "peach_tree",      "price_silver": 8},
			{"item_id": "lemon_tree",      "price_silver": 8},
			{"item_id": "tree",            "price_silver": 5},
		]
	},
	"doctor_kenku": {
		"id": "doctor_kenku",
		"name": "Sarabird",
		"shop_name": "Sarabird's Apothecary",
		"description": "A sharp-eyed Kenku physician. Sells remedies, recipes, and rare knowledge.",
		"npc_tile_type": "MOUNTAIN",
		"map_position": Vector2i(1, 7),
		"color": [0.28, 0.32, 0.52],
		"sprite":   "res://assets/sprites/npcs/doctor_kenku.png",
		"portrait": "res://assets/sprites/npcs/doctor_kenku_portrait.png",
		"inventory": [
			{"item_id": "bread",               "price_silver": 8},
			{"item_id": "recipe_axe",          "price_silver": 5},
			{"item_id": "recipe_pickaxe",      "price_silver": 5},
			{"item_id": "recipe_fishing_rod",  "price_silver": 5},
			{"item_id": "recipe_wrapped_potato",           "price_silver": 3},
			{"item_id": "recipe_french_fries",             "price_silver": 3},
			{"item_id": "recipe_veggie_salad",             "price_silver": 3},
			{"item_id": "recipe_mushroom_soup",            "price_silver": 5},
			{"item_id": "recipe_tomato_omelette",          "price_silver": 5},
			{"item_id": "recipe_mushroom_omelette",        "price_silver": 5},
			{"item_id": "recipe_pumpkin_bread",            "price_silver": 8},
			{"item_id": "recipe_carrot_cake",              "price_silver": 8},
			{"item_id": "recipe_golden_potato_cake",       "price_silver": 12},
			{"item_id": "recipe_upside_down_tomato_cake",  "price_silver": 12},
			{"item_id": "recipe_pumpkin_spice_cake",       "price_silver": 0,  "price_gold": 1},
			{"item_id": "recipe_grape_tart_cake",          "price_silver": 0,  "price_gold": 1},
			{"item_id": "recipe_combat_health_potion",     "price_silver": 15},
			{"item_id": "recipe_combat_stamina_potion",    "price_silver": 15},
			{"item_id": "recipe_chicken_feed",             "price_silver": 3},
		]
	},
	"miconid_fungus": {
		"id": "miconid_fungus",
		"name": "Mushroom Gus",
		"shop_name": "Mushroom Gus's Trading Post",
		"description": "A jolly fungal merchant deep in the forest. Pays gold for fresh fish brought from the pond.",
		"npc_tile_type": "FOREST",
		"map_position": Vector2i(8, 7),
		"color": [0.52, 0.28, 0.62],
		"sprite":   "res://assets/sprites/npcs/miconid_fungus.png",
		"portrait": "res://assets/sprites/npcs/miconid_fungus_portrait.png",
		"inventory": [],
		"buys": [
			{"item_id": "tadpole",        "price_gold": 0.1},
			{"item_id": "frog",           "price_gold": 0.2},
			{"item_id": "grey_chubfish",  "price_gold": 0.2},
			{"item_id": "yellow_chubfish","price_gold": 0.2},
			{"item_id": "red_chubfish",   "price_gold": 0.3},
			{"item_id": "orange_bluegill","price_gold": 0.4},
			{"item_id": "blue_bluegill",  "price_gold": 0.4},
			{"item_id": "yellow_bluegill","price_gold": 0.4},
			{"item_id": "catfish",        "price_gold": 0.5},
			{"item_id": "black_crappie",  "price_gold": 0.5},
			{"item_id": "crucian_carp",   "price_gold": 0.6},
			{"item_id": "lotus_carp",     "price_gold": 1.0},
			{"item_id": "albino_catfish", "price_gold": 2.0},
			{"item_id": "golden_koi",     "price_gold": 3.0},
		]
	}
}

func _ready() -> void:
	_load_discovered()

func get_npc(npc_id: String) -> Dictionary:
	return npcs.get(npc_id, {})

func get_all_map_npcs() -> Array:
	var result: Array = []
	for npc_id in npcs:
		result.append(npcs[npc_id])
	return result

func discover_npc(npc_id: String) -> void:
	if discovered_npcs.has(npc_id) or not npcs.has(npc_id):
		return
	discovered_npcs[npc_id] = true
	npc_discovered.emit(npc_id)
	_save_discovered()

func is_discovered(npc_id: String) -> bool:
	return discovered_npcs.has(npc_id)

func get_all_npcs_for_hud() -> Array:
	var result: Array = []
	for npc_id in npcs:
		var npc: Dictionary = npcs[npc_id].duplicate()
		npc["discovered"] = discovered_npcs.has(npc_id)
		result.append(npc)
	return result

func get_npc_tile_id(npc_id: String) -> String:
	return "npc_" + npc_id

func _save_discovered() -> void:
	var cfg := ConfigFile.new()
	cfg.set_value("npcs", "discovered", var_to_str(discovered_npcs))
	cfg.save("user://npc_data.cfg")

func _load_discovered() -> void:
	var cfg := ConfigFile.new()
	if cfg.load("user://npc_data.cfg") != OK:
		return
	var loaded: Variant = str_to_var(cfg.get_value("npcs", "discovered", "{}"))
	if loaded is Dictionary:
		discovered_npcs = loaded
