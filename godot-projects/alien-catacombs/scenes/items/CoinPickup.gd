extends Area2D

# Coin pickup - adds to coin counter by type (blue, green, orange)

export(String, "blue", "green", "orange") var coin_type := "blue"

var coin_manager = null

func _ready():
	# Wait for scene tree to be ready
	yield(get_tree(), "idle_frame")
	coin_manager = get_node_or_null("/root/CoinManager")

	# Connect to player detection
	connect("body_entered", self, "_on_body_entered")

func _on_body_entered(body):
	if body.is_in_group("player"):
		_pickup(body)

func _pickup(player):
	if not coin_manager:
		print("CoinManager not found!")
		queue_free()
		return

	# Add coin to counter by type
	coin_manager.add_coin(coin_type)

	# TODO: Play coin pickup sound/animation

	# Remove coin from scene
	queue_free()
