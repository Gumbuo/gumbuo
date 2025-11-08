extends Node

# Item Database - Central registry of all collectible items in the game
# Tracks item definitions and collection progress

signal item_discovered(item_id)

# All items in the game
var items = {}

# Items the player has discovered
var discovered_items = []

func _ready():
	_initialize_items()

func _initialize_items():
	# WEAPONS
	add_item("weapon_pistol", {
		"name": "Luger",
		"type": "weapon",
		"category": "Weapons",
		"sprite": "res://asset/weapons/Luger.png",
		"description": "German semi-automatic pistol. Fast fire rate.",
		"damage": 10,
		"fire_rate": 0.3,
		"bullet_speed": 400
	})

	add_item("weapon_rifle", {
		"name": "M15",
		"type": "weapon",
		"category": "Weapons",
		"sprite": "res://asset/weapons/M15.png",
		"description": "Military assault rifle. Balanced stats.",
		"damage": 15,
		"fire_rate": 0.4,
		"bullet_speed": 500
	})

	add_item("weapon_shotgun", {
		"name": "Shotgun",
		"type": "weapon",
		"category": "Weapons",
		"sprite": "res://asset/weapons/Shotgun.png",
		"description": "Close range powerhouse. High damage, slow fire.",
		"damage": 25,
		"fire_rate": 1.0,
		"bullet_speed": 350
	})

	# HELMETS
	add_item("helmet_crown", {
		"name": "Stone Crown",
		"type": "cosmetic",
		"slot": "helmet",
		"category": "Helmets",
		"sprite": "res://asset/items/item132.png",
		"description": "A regal stone crown for dungeon royalty."
	})

	add_item("helmet_iron", {
		"name": "Iron Helmet",
		"type": "cosmetic",
		"slot": "helmet",
		"category": "Helmets",
		"sprite": "res://asset/items/item30.png",
		"description": "Sturdy iron helmet for protection."
	})

	add_item("helmet_wizard", {
		"name": "Wizard Hat",
		"type": "cosmetic",
		"slot": "helmet",
		"category": "Helmets",
		"sprite": "res://asset/items/item128.png",
		"description": "Mysterious hat of the arcane arts."
	})

	add_item("helmet_horned", {
		"name": "Horned Helm",
		"type": "cosmetic",
		"slot": "helmet",
		"category": "Helmets",
		"sprite": "res://asset/items/item134.png",
		"description": "Intimidating helmet with curved horns."
	})

	# BODY ARMOR
	add_item("armor_leather", {
		"name": "Leather Armor",
		"type": "cosmetic",
		"slot": "body",
		"category": "Armor",
		"sprite": "res://asset/items/item137.png",
		"description": "Light leather armor for mobility."
	})

	add_item("armor_chain", {
		"name": "Chainmail",
		"type": "cosmetic",
		"slot": "body",
		"category": "Armor",
		"sprite": "res://asset/items/item138.png",
		"description": "Interlocking metal rings for defense."
	})

	add_item("armor_plate", {
		"name": "Plate Armor",
		"type": "cosmetic",
		"slot": "body",
		"category": "Armor",
		"sprite": "res://asset/items/item140.png",
		"description": "Heavy plate armor. Maximum protection."
	})

	add_item("armor_dark", {
		"name": "Dark Knight Armor",
		"type": "cosmetic",
		"slot": "body",
		"category": "Armor",
		"sprite": "res://asset/items/item142.png",
		"description": "Mysterious black armor of unknown origin."
	})

	# ACCESSORIES
	add_item("accessory_cape_red", {
		"name": "Red Cape",
		"type": "cosmetic",
		"slot": "accessory",
		"category": "Accessories",
		"sprite": "res://asset/items/item416.png",
		"description": "A flowing red cape for heroes."
	})

	add_item("accessory_cape_blue", {
		"name": "Blue Cape",
		"type": "cosmetic",
		"slot": "accessory",
		"category": "Accessories",
		"sprite": "res://asset/items/item415.png",
		"description": "A royal blue cape."
	})

	add_item("accessory_wings", {
		"name": "Angel Wings",
		"type": "cosmetic",
		"slot": "accessory",
		"category": "Accessories",
		"sprite": "res://asset/items/item623.png",
		"description": "Divine wings that shimmer with light."
	})

	add_item("accessory_demon_wings", {
		"name": "Demon Wings",
		"type": "cosmetic",
		"slot": "accessory",
		"category": "Accessories",
		"sprite": "res://asset/items/item624.png",
		"description": "Dark wings from the abyss."
	})

	# CONSUMABLES
	add_item("potion_health", {
		"name": "Health Potion",
		"type": "consumable",
		"category": "Potions",
		"sprite": "res://asset/items/PotionH.png",
		"description": "Restores 50 health points."
	})

	add_item("potion_mana", {
		"name": "Mana Potion",
		"type": "consumable",
		"category": "Potions",
		"sprite": "res://asset/items/PotionK.png",
		"description": "Restores 50 mana points."
	})

	add_item("potion_speed", {
		"name": "Speed Potion",
		"type": "consumable",
		"category": "Potions",
		"sprite": "res://asset/items/PotionL.png",
		"description": "Increases movement speed for 30 seconds."
	})

func add_item(item_id: String, item_data: Dictionary):
	item_data["id"] = item_id
	items[item_id] = item_data

func get_item(item_id: String) -> Dictionary:
	return items.get(item_id, {})

func discover_item(item_id: String):
	if not discovered_items.has(item_id):
		discovered_items.append(item_id)
		emit_signal("item_discovered", item_id)
		print("Discovered new item: ", items[item_id].get("name"))

func is_discovered(item_id: String) -> bool:
	return discovered_items.has(item_id)

func get_items_by_category(category: String) -> Array:
	var result = []
	for item_id in items.keys():
		if items[item_id].get("category") == category:
			result.append(items[item_id])
	return result

func get_all_categories() -> Array:
	var categories = []
	for item_id in items.keys():
		var cat = items[item_id].get("category")
		if cat != null and not categories.has(cat):
			categories.append(cat)
	return categories

func get_discovery_stats() -> Dictionary:
	return {
		"total_items": items.size(),
		"discovered": discovered_items.size(),
		"percentage": (float(discovered_items.size()) / float(items.size())) * 100.0 if items.size() > 0 else 0.0
	}
