extends Area2D

# Weapon pickup that adds weapon to player's arsenal

export var item_id := "weapon_rifle"  # ID from ItemDatabase

var item_database = null

func _ready():
	# Get item database
	yield(get_tree(), "idle_frame")
	item_database = get_node_or_null("/root/ItemDatabase")

	connect("body_entered", self, "_on_body_entered")

func _on_body_entered(body):
	if body.is_in_group("player"):
		_pickup(body)

func _pickup(player):
	# Get the weapon manager
	var weapon_manager = get_node_or_null("/root/WeaponManager")
	if not weapon_manager or not item_database:
		print("WeaponManager or ItemDatabase not found!")
		return

	# Get weapon data from database
	var weapon_data = item_database.get_item(item_id)
	if weapon_data.empty():
		print("Weapon not found in database: ", item_id)
		return

	# Mark as discovered
	item_database.discover_item(item_id)

	# Add weapon (always succeeds, adds to count)
	weapon_manager.add_weapon(item_id)
	print("Picked up: " + weapon_data.name)

	# Remove from scene
	queue_free()
