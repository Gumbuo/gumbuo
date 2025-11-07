extends Node

# Weapon Manager - Tracks collected weapons and active weapon

signal weapon_collected(weapon_type, new_count)
signal weapon_switched(weapon_type)

# Weapon counts - how many of each collected
var weapon_counts = {
	"weapon_pistol": 1,  # Start with 1 pistol
	"weapon_rifle": 0,
	"weapon_shotgun": 0
}

# Current active weapon
var active_weapon = "weapon_pistol"

# Weapon data from ItemDatabase
var item_database = null

func _ready():
	yield(get_tree(), "idle_frame")
	item_database = get_node_or_null("/root/ItemDatabase")

func _input(event):
	# Switch weapons with number keys 1, 2, 3
	if event.is_action_pressed("weapon_1"):
		switch_weapon("weapon_pistol")
	elif event.is_action_pressed("weapon_2"):
		switch_weapon("weapon_rifle")
	elif event.is_action_pressed("weapon_3"):
		switch_weapon("weapon_shotgun")

func add_weapon(weapon_type: String):
	if weapon_counts.has(weapon_type):
		weapon_counts[weapon_type] += 1
		emit_signal("weapon_collected", weapon_type, weapon_counts[weapon_type])
		print("Collected ", weapon_type, " | Total: ", weapon_counts[weapon_type])

func switch_weapon(weapon_type: String):
	# Can only switch to weapons you have
	if weapon_counts.get(weapon_type, 0) > 0:
		active_weapon = weapon_type
		emit_signal("weapon_switched", weapon_type)
		print("Switched to: ", weapon_type)

func get_weapon_count(weapon_type: String) -> int:
	return weapon_counts.get(weapon_type, 0)

func get_active_weapon() -> String:
	return active_weapon

func has_weapon(weapon_type: String) -> bool:
	return weapon_counts.get(weapon_type, 0) > 0

func get_weapon_data(weapon_type: String) -> Dictionary:
	if item_database:
		return item_database.get_item(weapon_type)
	return {}
