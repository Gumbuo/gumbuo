extends CanvasLayer

# Displays coin count on screen - tracks 3 types

onready var blue_label = $HBoxContainer/BlueRow/BlueLabel
onready var green_label = $HBoxContainer/GreenRow/GreenLabel
onready var orange_label = $HBoxContainer/OrangeRow/OrangeLabel

var coin_manager = null

func _ready():
	# Wait for scene tree
	yield(get_tree(), "idle_frame")
	coin_manager = get_node_or_null("/root/CoinManager")

	if coin_manager:
		# Connect to coin changes
		coin_manager.connect("coins_changed", self, "_on_coins_changed")

		# Set initial values
		_on_coins_changed("blue", coin_manager.get_coin_count("blue"))
		_on_coins_changed("green", coin_manager.get_coin_count("green"))
		_on_coins_changed("orange", coin_manager.get_coin_count("orange"))

func _on_coins_changed(coin_type: String, new_amount: int):
	match coin_type:
		"blue":
			if blue_label:
				blue_label.text = str(new_amount)
		"green":
			if green_label:
				green_label.text = str(new_amount)
		"orange":
			if orange_label:
				orange_label.text = str(new_amount)
