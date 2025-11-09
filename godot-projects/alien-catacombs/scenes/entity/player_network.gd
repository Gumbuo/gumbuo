extends "res://scenes/entity/player.gd"

# Network synchronization
puppet var puppet_position = Vector2()
puppet var puppet_velocity_direction = Vector2()
puppet var puppet_look_direction = Vector2()
puppet var puppet_weapon = Weapon.PISTOL

# Player identification
var player_id = 1
var is_local_player = false

# Player colors for visual distinction
var player_colors = [
	Color(1, 0, 0),      # Red
	Color(0, 1, 0),      # Green
	Color(0, 0, 1),      # Blue
	Color(1, 1, 0),      # Yellow
	Color(1, 0, 1),      # Magenta
	Color(0, 1, 1),      # Cyan
	Color(1, 0.5, 0),    # Orange
	Color(0.5, 0, 1)     # Purple
]

func _ready():
	# Call parent ready
	._ready()

	# Set network master
	if is_local_player:
		set_network_master(player_id)

	# Apply player color for visual distinction
	if has_node("Sprite"):
		var color_index = (player_id - 1) % player_colors.size()
		$Sprite.modulate = player_colors[color_index]

	# Disable input processing for non-local players
	set_process_input(is_local_player)
	set_physics_process(true)

func _physics_process(delta):
	# Only process input for local player
	if is_local_player and is_network_master():
		# Send position to other players
		rset_unreliable("puppet_position", position)
		rset_unreliable("puppet_velocity_direction", velocity_direction)
		rset_unreliable("puppet_look_direction", look_direction)
		rset_unreliable("puppet_weapon", current_weapon)
	else:
		# Remote players: interpolate to puppet position
		position = lerp(position, puppet_position, 0.3)
		velocity_direction = puppet_velocity_direction
		look_direction = puppet_look_direction
		current_weapon = puppet_weapon

# Override shoot function to sync across network
func shoot():
	if not is_local_player:
		return  # Only local player can shoot

	# Call original shoot function
	.shoot()

	# Sync shooting across network
	if get_tree().network_peer:
		var mouse_position = get_global_mouse_position()
		rpc("remote_shoot", position, mouse_position, current_weapon)

# Remote shoot called on other clients
remotesync func remote_shoot(shoot_pos, target_pos, weapon_type):
	# This gets called on remote clients to show the bullet
	var shoot_direction = (target_pos - shoot_pos).normalized()

	# Select correct bullet scene
	var bullet_scene
	var pellet_count = 1
	var spread_angle = 0.0

	match weapon_type:
		Weapon.PISTOL:
			bullet_scene = bullet_pistol
		Weapon.RIFLE:
			bullet_scene = bullet_rifle
		Weapon.SHOTGUN:
			bullet_scene = bullet_shotgun
			pellet_count = 5
			spread_angle = 30.0

	# Create bullets
	for i in range(pellet_count):
		var bullet = bullet_scene.instance()
		bullet.position = shoot_pos

		# Set bullet owner to avoid self-damage
		if bullet.has_method("set_owner_id"):
			bullet.set_owner_id(player_id)

		# Calculate spread for shotgun
		if pellet_count > 1:
			var angle_offset = -spread_angle/2 + (spread_angle / (pellet_count - 1)) * i
			var angle_rad = deg2rad(angle_offset)
			var rotated_dir = Vector2(
				shoot_direction.x * cos(angle_rad) - shoot_direction.y * sin(angle_rad),
				shoot_direction.x * sin(angle_rad) + shoot_direction.y * cos(angle_rad)
			)
			bullet.direction = rotated_dir
		else:
			bullet.direction = shoot_direction

		# Add bullet to scene
		get_parent().call_deferred("add_child", bullet)

func set_player_id(id):
	player_id = id
	is_local_player = (id == get_tree().get_network_unique_id())
	name = "Player" + str(id)
