extends Node

# Weapon Manager - Manages player's weapons and switching

signal weapon_switched(weapon)
signal weapon_added(weapon)

var weapons = []
var current_weapon_index := 0
export var max_weapons := 3

func _ready():
	# Start with default pistol
	add_weapon({
		"name": "Pistol",
		"damage": 10,
		"fire_rate": 0.3,
		"bullet_speed": 300,
		"type": "pistol"
	})

func _input(event):
	# Switch weapons with number keys 1, 2, 3
	if event.is_action_pressed("weapon_1") and weapons.size() >= 1:
		switch_weapon(0)
	elif event.is_action_pressed("weapon_2") and weapons.size() >= 2:
		switch_weapon(1)
	elif event.is_action_pressed("weapon_3") and weapons.size() >= 3:
		switch_weapon(2)

func add_weapon(weapon: Dictionary) -> bool:
	# Check if already have this weapon type
	for w in weapons:
		if w.get("type") == weapon.get("type"):
			return false  # Already have this weapon

	if weapons.size() >= max_weapons:
		return false  # Max weapons reached

	weapons.append(weapon)
	emit_signal("weapon_added", weapon)

	# Auto-switch to new weapon
	current_weapon_index = weapons.size() - 1
	emit_signal("weapon_switched", weapon)
	return true

func switch_weapon(index: int):
	if index >= 0 and index < weapons.size():
		current_weapon_index = index
		emit_signal("weapon_switched", weapons[current_weapon_index])

func get_current_weapon() -> Dictionary:
	if weapons.size() > 0 and current_weapon_index < weapons.size():
		return weapons[current_weapon_index]
	return {}

func next_weapon():
	if weapons.size() > 1:
		current_weapon_index = (current_weapon_index + 1) % weapons.size()
		emit_signal("weapon_switched", weapons[current_weapon_index])

func previous_weapon():
	if weapons.size() > 1:
		current_weapon_index = (current_weapon_index - 1 + weapons.size()) % weapons.size()
		emit_signal("weapon_switched", weapons[current_weapon_index])
