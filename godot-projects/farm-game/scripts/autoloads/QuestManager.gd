extends Node

# Daily turn-in quests, one rotating set per NPC. Rewards reuse each item's
# existing sell_price_silver/sell_price_gold from items.json as the rarity
# signal instead of a separate balancing table — gold-priced items (rare
# ores/gems/ingots) pay out Gold, everything else pays Silver.

const SAVE_PATH := "user://quests.cfg"

const NPC_ITEM_POOLS: Dictionary = {
	# Tom (Tomcat) — mountain materials: ores, gems, ingots, stone/clay bricks.
	# This is the full set of mountain-themed materials in the game.
	"cat_fisherman": [
		"stone", "clay", "iron_ore", "silver_ore", "gold_ore",
		"amethyst", "ruby", "emerald", "sapphire",
		"iron_ingot", "silver_ingot", "gold_ingot",
		"stone_brick", "clay_brick",
	],
	# Gus (Mushroom Gus) — food/cooked dishes (his existing fish "buys" list is
	# separate, untouched). Essentially every cooked dish in the game.
	"miconid_fungus": [
		"apple", "pear", "peach", "lemon",
		"bread", "wine", "wrapped_potato", "french_fries",
		"veggie_salad", "fruit_salad", "mushroom_soup",
		"tomato_omelette", "mushroom_omelette", "pumpkin_bread",
		"carrot_cake", "golden_potato_cake", "upside_down_tomato_cake",
		"pumpkin_spice_cake", "grape_tart_cake",
	],
	# Sarabird — forest items (wood, plank, mushroom) plus the bee/coop
	# byproducts (eggs, honey, beeswax, chicken feed) — the smallest theme in
	# the game's item set, so the odds-and-ends land here to balance it out.
	"doctor_kenku": [
		"wood", "wood_plank", "mushroom",
		"egg_white", "egg_gold", "honey", "beeswax", "chicken_feed",
	],
	# Frog Lilly — grassland/crops, plus what's crafted directly from them
	# (cotton thread and its dyed variants, wheat flour, grape must).
	"frog_ricefarmer": [
		"wheat", "carrot", "pumpkin",
		"red_flower", "yellow_flower", "blue_flower",
		"cotton", "grapes", "tomato", "fern", "cucumber", "potato",
		"red_rose", "pink_rose", "dark_red_rose",
		"yellow_rose", "white_rose", "beige_rose",
		"cotton_thread", "cotton_thread_blue", "cotton_thread_brown",
		"cotton_thread_green", "cotton_thread_orange", "cotton_thread_red",
		"cotton_thread_yellow", "wheat_flour", "grape_must",
	],
}

# npc_id -> Array[{item_id, amount, xp_reward, silver_reward, gold_reward, done}]
var _quests: Dictionary = {}
var _last_reset_unix: int = 0

func _ready() -> void:
	_load()
	if PlayerData.is_new_calendar_day(_last_reset_unix):
		_generate_all()
		_last_reset_unix = int(Time.get_unix_time_from_system())
		# Local save only — no WebPersistence.flush() here. Flushing forces an
		# immediate IndexedDB write-sync; doing that unconditionally from an
		# autoload's _ready() runs at the same early point in boot where other
		# autoloads (ResourceManager, PlayerData) are still loading their own
		# data, and forcing a sync mid-load risks writing back a half-loaded
		# state and stomping the player's real save. Only turn_in() (an actual
		# user action worth persisting immediately) flushes.
		_save_local()

func get_quests(npc_id: String) -> Array:
	return _quests.get(npc_id, [])

func turn_in(npc_id: String, idx: int) -> Dictionary:
	var list: Array = _quests.get(npc_id, [])
	if idx < 0 or idx >= list.size():
		return {}
	var q: Dictionary = list[idx]
	if q.get("done", false):
		return {}
	var item_id: String = q["item_id"]
	var amount: int = q["amount"]
	if not ResourceManager.has_item(item_id, amount):
		return {}
	ResourceManager.remove_item(item_id, amount)
	PlayerData.add_xp(q["xp_reward"])
	if q["gold_reward"] > 0.0:
		PlayerData.add_gold(q["gold_reward"])
	if q["silver_reward"] > 0:
		PlayerData.add_silver(q["silver_reward"])
	q["done"] = true
	_save()
	return q

func _generate_all() -> void:
	_quests.clear()
	for npc_id in NPC_ITEM_POOLS:
		var list: Array = []
		for item_id in NPC_ITEM_POOLS[npc_id]:
			list.append(_make_quest(item_id))
		_quests[npc_id] = list

func _make_quest(item_id: String) -> Dictionary:
	var info: Dictionary = ResourceManager.get_item_info(item_id)
	var price_s: int = info.get("sell_price_silver", 0)
	var price_g: float = info.get("sell_price_gold", 0.0)
	var use_gold: bool = price_g > 0.0
	var amount: int
	if use_gold:
		amount = randi_range(2, 5)
	elif price_s > 8:
		amount = randi_range(3, 6)
	elif price_s > 3:
		amount = randi_range(5, 10)
	else:
		amount = randi_range(8, 15)
	var xp_reward: int
	var silver_reward: int = 0
	var gold_reward: float = 0.0
	if use_gold:
		xp_reward = 15 + amount * 2
		gold_reward = snappedf(amount * price_g * 1.5, 0.01)
	else:
		xp_reward = 15 + amount
		silver_reward = int(round(amount * price_s * 1.8))
	return {
		"item_id": item_id,
		"amount": amount,
		"xp_reward": xp_reward,
		"silver_reward": silver_reward,
		"gold_reward": gold_reward,
		"done": false,
	}

func _save_local() -> void:
	var cfg := ConfigFile.new()
	cfg.set_value("quests", "last_reset_unix", _last_reset_unix)
	cfg.set_value("quests", "data", var_to_str(_quests))
	cfg.save(SAVE_PATH)

func _save() -> void:
	_save_local()
	WebPersistence.flush()

func _load() -> void:
	var cfg := ConfigFile.new()
	if cfg.load(SAVE_PATH) != OK:
		return
	_last_reset_unix = cfg.get_value("quests", "last_reset_unix", 0)
	var loaded: Variant = str_to_var(cfg.get_value("quests", "data", "{}"))
	if loaded is Dictionary:
		_quests = loaded
