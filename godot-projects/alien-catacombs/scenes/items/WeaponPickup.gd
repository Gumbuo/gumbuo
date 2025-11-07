extends Area2D

# Weapon pickup that adds weapon to player's arsenal

export var weapon_name := "Rifle"
export var weapon_type := "rifle"
export var damage := 15
export var fire_rate := 0.5
export var bullet_speed := 400

func _ready():
	connect("body_entered", self, "_on_body_entered")

func _on_body_entered(body):
	if body.is_in_group("player"):
		_pickup(body)

func _pickup(player):
	# Get the weapon manager
	var weapon_manager = get_node_or_null("/root/WeaponManager")
	if not weapon_manager:
		print("WeaponManager not found!")
		return

	# Create weapon data
	var weapon_data = {
		"name": weapon_name,
		"type": weapon_type,
		"damage": damage,
		"fire_rate": fire_rate,
		"bullet_speed": bullet_speed
	}

	# Try to add weapon
	if weapon_manager.add_weapon(weapon_data):
		print("Picked up: " + weapon_name)
		queue_free()  # Remove from scene
	else:
		print("Already have this weapon or inventory full!")
