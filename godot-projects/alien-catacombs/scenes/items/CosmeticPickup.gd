extends Area2D

# Cosmetic Item Pickup - Collectable wearable items
# Items are added to inventory and can be equipped from there

export var item_id := "helmet_crown"  # ID from ItemDatabase

onready var sprite = $Sprite
onready var animation_player = $AnimationPlayer

var item_database = null

func _ready():
	# Get item database
	yield(get_tree(), "idle_frame")
	item_database = get_node_or_null("/root/ItemDatabase")

	# Load item data from database
	if item_database:
		var item_data = item_database.get_item(item_id)
		if item_data.has("sprite"):
			var texture = load(item_data.sprite)
			if texture:
				sprite.texture = texture

	# Connect to player detection
	connect("body_entered", self, "_on_body_entered")

	# Start floating animation
	if animation_player:
		animation_player.play("float")

func _on_body_entered(body):
	if body.is_in_group("player"):
		_pickup(body)

func _pickup(player):
	# Get inventory system
	var inventory = get_node_or_null("/root/Inventory")
	if not inventory or not item_database:
		print("No inventory or database found")
		queue_free()
		return

	# Get item data from database
	var item_data = item_database.get_item(item_id)
	if item_data.empty():
		print("Item not found in database: ", item_id)
		queue_free()
		return

	# Mark as discovered
	item_database.discover_item(item_id)

	# Add to inventory
	if inventory.add_item(item_data):
		print("Picked up: ", item_data.name)
		# TODO: Add pickup sound/animation
		queue_free()
	else:
		print("Inventory full!")
