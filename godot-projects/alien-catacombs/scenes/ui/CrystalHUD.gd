extends CanvasLayer

# Displays crystal count on screen - tracks 4 types

onready var blue_label = $HBoxContainer/BlueRow/BlueLabel
onready var green_label = $HBoxContainer/GreenRow/GreenLabel
onready var purple_label = $HBoxContainer/PurpleRow/PurpleLabel
onready var red_label = $HBoxContainer/RedRow/RedLabel

var crystal_manager = null

func _ready():
	# Wait for scene tree
	yield(get_tree(), "idle_frame")
	crystal_manager = get_node_or_null("/root/CrystalManager")

	if crystal_manager:
		# Connect to crystal changes
		crystal_manager.connect("crystals_changed", self, "_on_crystals_changed")

		# Set initial values
		_on_crystals_changed("blue", crystal_manager.get_crystal_count("blue"))
		_on_crystals_changed("green", crystal_manager.get_crystal_count("green"))
		_on_crystals_changed("purple", crystal_manager.get_crystal_count("purple"))
		_on_crystals_changed("red", crystal_manager.get_crystal_count("red"))

func _on_crystals_changed(crystal_type: String, new_amount: int):
	match crystal_type:
		"blue":
			if blue_label:
				blue_label.text = str(new_amount)
		"green":
			if green_label:
				green_label.text = str(new_amount)
		"purple":
			if purple_label:
				purple_label.text = str(new_amount)
		"red":
			if red_label:
				red_label.text = str(new_amount)
