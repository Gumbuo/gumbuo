extends Node

# Global crystal counter system - tracks 4 types of crystals

signal crystals_changed(crystal_type, new_amount)

var blue_crystals := 0
var green_crystals := 0
var purple_crystals := 0
var red_crystals := 0

func add_crystal(crystal_type: String):
	match crystal_type:
		"blue":
			blue_crystals += 1
			emit_signal("crystals_changed", "blue", blue_crystals)
			print("Blue crystal collected! Total: ", blue_crystals)
		"green":
			green_crystals += 1
			emit_signal("crystals_changed", "green", green_crystals)
			print("Green crystal collected! Total: ", green_crystals)
		"purple":
			purple_crystals += 1
			emit_signal("crystals_changed", "purple", purple_crystals)
			print("Purple crystal collected! Total: ", purple_crystals)
		"red":
			red_crystals += 1
			emit_signal("crystals_changed", "red", red_crystals)
			print("Red crystal collected! Total: ", red_crystals)

	# Notify GameStats for leaderboard tracking
	if GameStats:
		GameStats.add_coin(crystal_type)  # Reuse coin tracking for now

func get_crystal_count(crystal_type: String) -> int:
	match crystal_type:
		"blue":
			return blue_crystals
		"green":
			return green_crystals
		"purple":
			return purple_crystals
		"red":
			return red_crystals
	return 0

func get_total_crystals() -> int:
	return blue_crystals + green_crystals + purple_crystals + red_crystals

func reset_crystals():
	blue_crystals = 0
	green_crystals = 0
	purple_crystals = 0
	red_crystals = 0
	emit_signal("crystals_changed", "blue", 0)
	emit_signal("crystals_changed", "green", 0)
	emit_signal("crystals_changed", "purple", 0)
	emit_signal("crystals_changed", "red", 0)

# Check if player has a specific crystal (for energy barriers)
func has_crystal(crystal_type: String) -> bool:
	return get_crystal_count(crystal_type) > 0
