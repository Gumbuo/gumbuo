extends Area2D

# Pickup item that adds itself to inventory when player touches it

export var item_name := "Item"
export var item_description := "A mysterious item"
export var item_icon := ""

func _ready():
	connect("body_entered", self, "_on_body_entered")

func _on_body_entered(body):
	if body.is_in_group("player"):
		_pickup(body)

func _pickup(player):
	# Get the global inventory
	var inventory = get_node_or_null("/root/Inventory")
	if not inventory:
		print("Inventory system not found!")
		return

	# Create item data
	var item_data = {
		"name": item_name,
		"description": item_description,
		"icon": item_icon
	}

	# Try to add to inventory
	if inventory.add_item(item_data):
		print("Picked up: " + item_name)
		queue_free()  # Remove from scene
	else:
		print("Inventory full!")
