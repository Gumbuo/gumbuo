extends Node

signal listing_added(listing: Dictionary)
signal listing_removed(listing_id: String)
signal trade_completed(listing_id: String, buyer_id: String)

# In-game resource market listings
# { listing_id -> { seller_id, item_id, quantity, price_silver, price_gold, listed_at } }
var resource_listings: Dictionary = {}

# P2P NFT deed listings (land tiles)
# { listing_id -> { seller_id, tile_id, tile_type, price_gold, listed_at } }
var deed_listings: Dictionary = {}

func list_resource(item_id: String, quantity: int, price_silver: int, price_gold: float = 0.0) -> bool:
	if not ResourceManager.has_item(item_id, quantity):
		return false
	ResourceManager.remove_item(item_id, quantity)
	var listing_id := _gen_id()
	resource_listings[listing_id] = {
		"id": listing_id,
		"seller_id": PlayerData.player_id,
		"item_id": item_id,
		"quantity": quantity,
		"price_silver": price_silver,
		"price_gold": price_gold,
		"listed_at": Time.get_unix_time_from_system()
	}
	listing_added.emit(resource_listings[listing_id])
	return true

func buy_resource(listing_id: String) -> bool:
	if not resource_listings.has(listing_id):
		return false
	var listing: Dictionary = resource_listings[listing_id]
	var silver_cost: int = listing["price_silver"]
	var gold_cost: float = float(listing["price_gold"])
	if not PlayerData.spend_silver(silver_cost):
		return false
	if gold_cost > 0.0 and not PlayerData.spend_gold(gold_cost):
		PlayerData.add_silver(silver_cost)
		return false
	ResourceManager.add_item(listing["item_id"], listing["quantity"])
	resource_listings.erase(listing_id)
	trade_completed.emit(listing_id, PlayerData.player_id)
	return true

func list_deed(tile_id: String, price_gold: float) -> bool:
	var listing_id := _gen_id()
	deed_listings[listing_id] = {
		"id": listing_id,
		"seller_id": PlayerData.player_id,
		"tile_id": tile_id,
		"price_gold": price_gold,
		"listed_at": Time.get_unix_time_from_system()
	}
	listing_added.emit(deed_listings[listing_id])
	return true

func buy_deed(listing_id: String) -> bool:
	if not deed_listings.has(listing_id):
		return false
	var listing: Dictionary = deed_listings[listing_id]
	if not PlayerData.spend_gold(listing["price_gold"]):
		return false
	deed_listings.erase(listing_id)
	trade_completed.emit(listing_id, PlayerData.player_id)
	return true

func cancel_resource_listing(listing_id: String) -> void:
	if not resource_listings.has(listing_id):
		return
	var listing: Dictionary = resource_listings[listing_id]
	if listing["seller_id"] != PlayerData.player_id:
		return
	ResourceManager.add_item(listing["item_id"], listing["quantity"])
	resource_listings.erase(listing_id)
	listing_removed.emit(listing_id)

func _gen_id() -> String:
	return "listing_" + str(randi()) + "_" + str(Time.get_unix_time_from_system())
