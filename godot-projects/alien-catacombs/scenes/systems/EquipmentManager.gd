extends Node

# Equipment Manager - Handles player cosmetic equipment
# Singleton for managing what the player is wearing

signal equipment_changed(slot, item)
signal item_equipped(item)
signal item_unequipped(slot)

# Equipment slots
var equipped = {
	"helmet": null,   # Head slot
	"body": null,     # Body/armor slot
	"accessory": null # Accessory slot (cape, wings, etc.)
}

func equip_item(item: Dictionary) -> bool:
	if not item.has("slot"):
		print("Item missing slot property")
		return false

	var slot = item.get("slot")
	if not equipped.has(slot):
		print("Invalid equipment slot: ", slot)
		return false

	# Unequip previous item in this slot
	if equipped[slot] != null:
		unequip_slot(slot)

	# Equip new item
	equipped[slot] = item
	emit_signal("equipment_changed", slot, item)
	emit_signal("item_equipped", item)
	print("Equipped ", item.get("name"), " in ", slot, " slot")
	return true

func unequip_slot(slot: String) -> bool:
	if not equipped.has(slot):
		return false

	if equipped[slot] == null:
		return false

	var item = equipped[slot]
	equipped[slot] = null
	emit_signal("equipment_changed", slot, null)
	emit_signal("item_unequipped", slot)
	print("Unequipped ", slot, " slot")

	# Add item back to inventory
	var inventory = get_node_or_null("/root/Inventory")
	if inventory:
		inventory.add_item(item)

	return true

func get_equipped(slot: String):
	return equipped.get(slot, null)

func get_all_equipped() -> Dictionary:
	return equipped.duplicate()

func is_slot_empty(slot: String) -> bool:
	return equipped.get(slot, null) == null

func clear_all_equipment():
	for slot in equipped.keys():
		if equipped[slot] != null:
			unequip_slot(slot)
