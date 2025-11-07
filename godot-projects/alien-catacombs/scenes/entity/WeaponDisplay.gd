extends Node2D

# WeaponDisplay - Shows the active weapon on the player

onready var weapon_sprite = $WeaponSprite

var weapon_manager = null
var item_database = null
var player_sprite = null

func _ready():
	# Wait for managers to be ready
	yield(get_tree(), "idle_frame")
	weapon_manager = get_node_or_null("/root/WeaponManager")
	item_database = get_node_or_null("/root/ItemDatabase")

	# Get reference to player's main sprite for flipping
	player_sprite = get_parent().get_node_or_null("sprite")

	if weapon_manager:
		weapon_manager.connect("weapon_switched", self, "_on_weapon_switched")
		weapon_manager.connect("weapon_collected", self, "_on_weapon_collected")
		_update_weapon_display()

func _process(delta):
	# Rotate weapon to point at mouse
	if weapon_sprite and weapon_sprite.visible:
		var mouse_pos = get_global_mouse_position()
		var player_pos = get_parent().global_position

		# Calculate angle to mouse
		var angle_to_mouse = (mouse_pos - player_pos).angle()

		# Check if mouse is on the left side (flip weapon)
		var facing_left = abs(angle_to_mouse) > PI / 2

		# Apply rotation
		weapon_sprite.rotation = angle_to_mouse

		# Flip weapon vertically when aiming left to prevent upside-down appearance
		if facing_left:
			weapon_sprite.flip_v = true
			weapon_sprite.position = Vector2(-8, -4)
		else:
			weapon_sprite.flip_v = false
			weapon_sprite.position = Vector2(8, -4)

func _on_weapon_switched(weapon_type):
	_update_weapon_display()

func _on_weapon_collected(weapon_type, new_count):
	_update_weapon_display()

func _update_weapon_display():
	if not weapon_manager or not item_database or not weapon_sprite:
		return

	var active_weapon = weapon_manager.get_active_weapon()

	# Only show weapon if player has at least 1
	if weapon_manager.get_weapon_count(active_weapon) <= 0:
		weapon_sprite.visible = false
		return

	# Get weapon data
	var weapon_data = item_database.get_item(active_weapon)
	if weapon_data.empty():
		weapon_sprite.visible = false
		return

	# Load and display weapon sprite
	var sprite_path = weapon_data.get("sprite", "")
	if sprite_path != "":
		var texture = load(sprite_path)
		if texture:
			weapon_sprite.texture = texture
			weapon_sprite.visible = true
			weapon_sprite.scale = Vector2(0.5, 0.5)  # Scale down the weapon
