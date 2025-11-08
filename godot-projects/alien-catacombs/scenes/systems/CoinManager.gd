extends Node

# Global coin counter system - tracks 3 types of coins

signal coins_changed(coin_type, new_amount)

var blue_coins := 0
var green_coins := 0
var orange_coins := 0

func add_coin(coin_type: String):
	match coin_type:
		"blue":
			blue_coins += 1
			emit_signal("coins_changed", "blue", blue_coins)
			print("Blue coin collected! Total: ", blue_coins)
		"green":
			green_coins += 1
			emit_signal("coins_changed", "green", green_coins)
			print("Green coin collected! Total: ", green_coins)
		"orange":
			orange_coins += 1
			emit_signal("coins_changed", "orange", orange_coins)
			print("Orange coin collected! Total: ", orange_coins)
n	# Notify GameStats for leaderboard tracking
	if GameStats:
		GameStats.add_coin(coin_type)

func get_coin_count(coin_type: String) -> int:
	match coin_type:
		"blue":
			return blue_coins
		"green":
			return green_coins
		"orange":
			return orange_coins
	return 0

func get_total_coins() -> int:
	return blue_coins + green_coins + orange_coins

func reset_coins():
	blue_coins = 0
	green_coins = 0
	orange_coins = 0
	emit_signal("coins_changed", "blue", 0)
	emit_signal("coins_changed", "green", 0)
	emit_signal("coins_changed", "orange", 0)
