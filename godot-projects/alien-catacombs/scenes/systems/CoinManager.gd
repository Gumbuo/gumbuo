extends Node

# Global crystal counter system - tracks 3 types of crystals (blue, green, purple)

signal coins_changed(coin_type, new_amount)

var blue_coins := 0
var green_coins := 0
var purple_coins := 0

func add_coin(coin_type: String):
	match coin_type:
		"blue":
			blue_coins += 1
			emit_signal("coins_changed", "blue", blue_coins)
			print("Blue crystal collected! Total: ", blue_coins)
		"green":
			green_coins += 1
			emit_signal("coins_changed", "green", green_coins)
			print("Green crystal collected! Total: ", green_coins)
		"purple":
			purple_coins += 1
			emit_signal("coins_changed", "purple", purple_coins)
			print("Purple crystal collected! Total: ", purple_coins)
	# Notify GameStats for leaderboard tracking
	if GameStats:
		GameStats.add_coin(coin_type)

func get_coin_count(coin_type: String) -> int:
	match coin_type:
		"blue":
			return blue_coins
		"green":
			return green_coins
		"purple":
			return purple_coins
	return 0

func get_total_coins() -> int:
	return blue_coins + green_coins + purple_coins

func reset_coins():
	blue_coins = 0
	green_coins = 0
	purple_coins = 0
	emit_signal("coins_changed", "blue", 0)
	emit_signal("coins_changed", "green", 0)
	emit_signal("coins_changed", "purple", 0)
