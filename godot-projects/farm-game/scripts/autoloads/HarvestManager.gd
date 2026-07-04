extends Node

signal harvest_completed(tile_id: String, visitor_id: String, item_id: String, visitor_amount: int, owner_amount: int)

func harvest(tile_id: String, item_id: String, total_amount: int, visitor_id: String) -> void:
	var tile: Dictionary = LandManager.tiles.get(tile_id, {})
	if tile.is_empty():
		ResourceManager.add_item(item_id, total_amount)
		PlayerData.add_xp(1)
		return

	var owner_id: String = tile.get("owner_id", "")
	var is_owner := visitor_id == owner_id

	if is_owner:
		ResourceManager.add_item(item_id, total_amount)
		PlayerData.add_xp(1)
		harvest_completed.emit(tile_id, visitor_id, item_id, total_amount, 0)
		return

	var yield_rate: int = tile.get("yield_rate", 70)
	var visitor_share := int(total_amount * yield_rate / 100.0)
	var owner_share := total_amount - visitor_share

	ResourceManager.add_item(item_id, visitor_share)
	if owner_share > 0:
		LandManager.add_to_passive_vault(tile_id, item_id, owner_share)

	PlayerData.add_xp(1)
	harvest_completed.emit(tile_id, visitor_id, item_id, visitor_share, owner_share)
