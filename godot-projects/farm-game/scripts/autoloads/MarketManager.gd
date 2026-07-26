extends Node

signal listing_added(listing: Dictionary)
signal listing_removed(listing_id: String)
signal trade_completed(listing_id: String, buyer_id: String)
signal listings_refreshed()

const API_URL := "https://foxstead.xyz/api/market"

# { listing_id -> { id, seller_id, item_id, quantity, price_gold, listed_at } }
var resource_listings: Dictionary = {}

func _ready() -> void:
	_fetch_listings()

func _fetch_listings() -> void:
	var req := HTTPRequest.new()
	add_child(req)
	req.request_completed.connect(func(_r, _c, _h, body: PackedByteArray):
		req.queue_free()
		var raw := body.get_string_from_utf8()
		var parsed = JSON.parse_string(raw)
		if not parsed is Dictionary:
			return
		var server_listings: Array = parsed.get("listings", [])
		resource_listings.clear()
		for l in server_listings:
			if l is Dictionary and l.has("id"):
				resource_listings[l["id"]] = l
		listings_refreshed.emit()
	)
	req.request(API_URL, ["Accept: application/json"])

func _post_action(payload: Dictionary) -> void:
	var body := JSON.stringify(payload)
	var req := HTTPRequest.new()
	add_child(req)
	req.request_completed.connect(func(_r, _c, _h, _b): req.queue_free())
	req.request(API_URL, ["Content-Type: application/json"], HTTPClient.METHOD_POST, body)

func list_resource(item_id: String, quantity: int, price_gold: float) -> bool:
	if not ResourceManager.has_item(item_id, quantity):
		return false
	ResourceManager.remove_item(item_id, quantity)
	var listing_id := _gen_id()
	var listing := {
		"id":         listing_id,
		"seller_id":  PlayerData.player_id,
		"item_id":    item_id,
		"quantity":   quantity,
		"price_gold": price_gold,
		"listed_at":  Time.get_unix_time_from_system()
	}
	resource_listings[listing_id] = listing
	listing_added.emit(listing)
	_post_action({"action": "list", "listing": listing})
	return true

func buy_resource(listing_id: String) -> bool:
	if not resource_listings.has(listing_id):
		return false
	var listing: Dictionary = resource_listings[listing_id]
	if not PlayerData.spend_gold(float(listing["price_gold"])):
		return false
	ResourceManager.add_item(listing["item_id"], listing["quantity"])
	resource_listings.erase(listing_id)
	trade_completed.emit(listing_id, PlayerData.player_id)
	_post_action({"action": "remove", "id": listing_id})
	_fetch_listings()
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
	_post_action({"action": "remove", "id": listing_id})

func _gen_id() -> String:
	return "listing_" + str(randi()) + "_" + str(Time.get_unix_time_from_system())
