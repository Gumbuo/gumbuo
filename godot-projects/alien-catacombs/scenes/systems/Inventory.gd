extends Node

# Global Inventory System
# Manages items that the player collects

signal inventory_changed
signal item_added(item)
signal item_removed(item)

var items = []
export var max_slots := 20

func _ready():
	pass

func add_item(item: Dictionary) -> bool:
	if items.size() >= max_slots:
		return false

	items.append(item)
	emit_signal("item_added", item)
	emit_signal("inventory_changed")
	return true

func remove_item(item: Dictionary) -> bool:
	var index = items.find(item)
	if index != -1:
		items.remove(index)
		emit_signal("item_removed", item)
		emit_signal("inventory_changed")
		return true
	return false

func has_item(item_name: String) -> bool:
	for item in items:
		if item.get("name") == item_name:
			return true
	return false

func get_item_count(item_name: String) -> int:
	var count = 0
	for item in items:
		if item.get("name") == item_name:
			count += 1
	return count

func clear():
	items.clear()
	emit_signal("inventory_changed")
