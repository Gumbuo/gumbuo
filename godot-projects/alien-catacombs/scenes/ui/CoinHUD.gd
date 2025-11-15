extends CanvasLayer

# Displays crystal count on screen - tracks 3 types (blue, green, purple)

onready var blue_label = $HBoxContainer/BlueRow/BlueLabel
onready var green_label = $HBoxContainer/GreenRow/GreenLabel
onready var purple_label = $HBoxContainer/PurpleRow/PurpleLabel

var coin_manager = null

func _ready():
	# Wait for scene tree
	yield(get_tree(), "idle_frame")
	coin_manager = get_node_or_null("/root/CoinManager")

	if coin_manager:
		# Connect to crystal changes
		coin_manager.connect("coins_changed", self, "_on_coins_changed")

		# Set initial values
		_on_coins_changed("blue", coin_manager.get_coin_count("blue"))
		_on_coins_changed("green", coin_manager.get_coin_count("green"))
		_on_coins_changed("purple", coin_manager.get_coin_count("purple"))

func _on_coins_changed(coin_type: String, new_amount: int):
	match coin_type:
		"blue":
			if blue_label:
				blue_label.text = str(new_amount)
		"green":
			if green_label:
				green_label.text = str(new_amount)
		"purple":
			if purple_label:
				purple_label.text = str(new_amount)
