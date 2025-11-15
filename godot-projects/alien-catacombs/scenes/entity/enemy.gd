extends Entity

class_name Enemy

# Enemy AI with patrol, chase, and attack behaviors
# Based on Gumbuo Fighters combat system

enum State { IDLE, PATROL, CHASE, ATTACK, HURT, DEAD }
var current_state = State.IDLE

# Attack Types for different enemy behaviors
enum AttackType { MELEE, RANGED, CONTACT, HEAVY_RANGED }
export(AttackType) var attack_type = AttackType.RANGED  # Default to ranged for backward compatibility

# AI Parameters
export var detection_range := 150.0
export var patrol_points: Array = []
var current_patrol_index := 0
export var is_stationary := false  # Stationary enemies don't move, only shoot

# Attack Parameters
export var shoot_range := 120.0  # Distance from which enemy starts shooting (RANGED/HEAVY_RANGED only)
export var melee_range := 16.0   # Distance for melee attacks (MELEE only)
export var contact_damage := 5   # Damage per second for contact enemies (CONTACT only)
export var melee_damage := 10    # Damage per melee hit (MELEE only)

var bullet_scene = preload("res://scenes/entity/bullet.tscn")
var shoot_cooldown := 1.0
var can_shoot := true
var can_melee := true
var melee_cooldown := 1.5

# Contact damage tracking
var is_contacting_player := false

# Knockback system
var knockback_velocity := Vector2.ZERO
var knockback_decay := 0.9  # How quickly knockback fades (0.9 = 10% loss per frame)

# Directional sprites system
export var use_directional_sprites := false
export var sprite_base_path := ""  # e.g., "res://asset/characters/pixellab/crawler_alien/rotations/"
var directional_textures: Dictionary = {}
enum Direction { SOUTH, SOUTH_EAST, EAST, NORTH_EAST, NORTH, NORTH_WEST, WEST, SOUTH_WEST }
var current_direction: int = Direction.SOUTH

# References
onready var health = $Health
onready var hurtbox = $Hurtbox
onready var detection_area = $DetectionArea

var target: Player = null

func _ready():
	speed = 48  # Reduced from 64 to make enemies slower

	# Connect health signals
	health.connect("damaged", self, "_on_damaged")
	health.connect("died", self, "_on_died")

	# Connect hurtbox
	hurtbox.connect("hit_received", self, "_on_hit_received")

	# Load directional sprites if enabled
	if use_directional_sprites and sprite_base_path != "":
		_load_directional_sprites()

func animation():
	# Don't override attack/hurt/dead animations
	if current_state == State.ATTACK or current_state == State.HURT or current_state == State.DEAD:
		return

	# Play idle animation by default (only for AnimatedSprite)
	if sprite and sprite is AnimatedSprite:
		if sprite.animation != "idle":
			sprite.play("idle")

func _physics_process(delta):
	if current_state == State.DEAD:
		return

	match current_state:
		State.IDLE:
			_state_idle()
		State.PATROL:
			_state_patrol()
		State.CHASE:
			_state_chase()
		State.ATTACK:
			_state_attack()
		State.HURT:
			_state_hurt()

	# Apply knockback velocity before normal movement
	if knockback_velocity.length() > 0.1:
		move_and_slide(knockback_velocity)
		knockback_velocity *= knockback_decay
	else:
		knockback_velocity = Vector2.ZERO
		._physics_process(delta)  # Call parent movement only if no knockback

func _state_idle():
	velocity_direction = Vector2.ZERO

	# Look for player
	if _can_see_player():
		current_state = State.CHASE
	elif patrol_points.size() > 0 and not is_stationary:
		current_state = State.PATROL

func _state_patrol():
	# Patrol between waypoints
	if patrol_points.size() == 0:
		current_state = State.IDLEd
		return

	# Check if player is nearby
	if _can_see_player():
		current_state = State.CHASE
		return

	# Move towards current patrol point
	var target_pos = patrol_points[current_patrol_index]
	var direction = (target_pos - global_position).normalized()

	if global_position.distance_to(target_pos) < 10:
		# Reached patrol point, go to next
		current_patrol_index = (current_patrol_index + 1) % patrol_points.size()

	velocity_direction = direction
	update_look_direction()

func _state_chase():
	if not target or target.health.is_dead:
		target = null
		current_state = State.IDLE
		return

	var distance_to_target = global_position.distance_to(target.global_position)

	# Too far, stop chasing
	if distance_to_target > detection_range * 1.5:
		target = null
		current_state = State.IDLE
		return

	# Stationary enemies don't move, just shoot when in range
	if is_stationary:
		velocity_direction = Vector2.ZERO
		update_look_direction()
		if attack_type == AttackType.RANGED or attack_type == AttackType.HEAVY_RANGED:
			if distance_to_target <= shoot_range and can_shoot:
				shoot_at_player()
		return

	# Movement and attack behavior based on attack type
	var direction = (target.global_position - global_position).normalized()

	match attack_type:
		AttackType.MELEE:
			# Chase until in melee range, then attack
			if distance_to_target > melee_range:
				velocity_direction = direction
				update_look_direction()
			else:
				velocity_direction = Vector2.ZERO
				if can_melee:
					melee_attack_player()

		AttackType.CONTACT:
			# Chase and damage on contact (jellyfish-style)
			velocity_direction = direction
			update_look_direction()
			# Contact damage is handled in _physics_process via Hurtbox overlap

		AttackType.RANGED, AttackType.HEAVY_RANGED:
			# Chase but keep some distance, shoot when in range
			if distance_to_target > shoot_range * 0.7:
				# Too far, move closer
				velocity_direction = direction
				update_look_direction()
			else:
				# In range, slow down and shoot
				velocity_direction = direction * 0.3  # Move slowly while shooting
				update_look_direction()
				if can_shoot:
					shoot_at_player()

func _state_attack():
	velocity_direction = Vector2.ZERO

	# Shoot at player
	if not can_shoot:
		current_state = State.CHASE
		return

	shoot_at_player()
	current_state = State.CHASE

func _state_hurt():
	# Brief stun when hurt
	velocity_direction = Vector2.ZERO
	yield(get_tree().create_timer(0.3), "timeout")
	current_state = State.CHASE

func _can_see_player() -> bool:
	# Simple detection - check if player is in detection area
	var players = get_tree().get_nodes_in_group("player")
	if players.size() == 0:
		return false

	target = players[0]
	var distance = global_position.distance_to(target.global_position)
	return distance <= detection_range

func _on_hit_received(damage: int, knockback_force: float, attacker_position: Vector2):
	if current_state == State.DEAD:
		return

	health.take_damage(damage)

	# Apply knockback as actual velocity (not just direction)
	var knockback_direction = (global_position - attacker_position).normalized()
	knockback_velocity = knockback_direction * knockback_force

	# Play hurt animation and enter hurt state
	if sprite and sprite is AnimatedSprite and sprite.frames.has_animation("hurt"):
		sprite.play("hurt")
	current_state = State.HURT

func _on_damaged(amount):
	# Visual feedback - flash red
	if sprite:
		sprite.modulate = Color(1, 0.3, 0.3)
		yield(get_tree().create_timer(0.1), "timeout")
		sprite.modulate = Color(1, 1, 1)

func _on_died():
	current_state = State.DEAD
	velocity_direction = Vector2.ZERO

	# Play death animation
	if sprite and sprite is AnimatedSprite and sprite.frames.has_animation("dead"):
		sprite.play("dead")
		# Disable collision
		$collision_shape_2d.set_deferred("disabled", true)
		# Remove after death animation
		yield(sprite, "animation_finished")
	else:
		# For Sprite nodes without animation, just fade and remove
		if sprite:
			sprite.modulate = Color(0.5, 0.5, 0.5, 0.5)
		# Disable collision
		var collision = get_node_or_null("collision_shape_2d")
		if not collision:
			collision = get_node_or_null("collision_shape")
		if collision:
			collision.set_deferred("disabled", true)
		yield(get_tree().create_timer(0.5), "timeout")

	# Notify GameStats for leaderboard tracking
	if GameStats:
		GameStats.add_kill()
	queue_free()

# Shooting function for RANGED and HEAVY_RANGED enemies
func shoot_at_player():
	if not target:
		return

	print("Enemy ", name, " shooting at player from position: ", global_position)
	can_shoot = false

	# Create bullet
	var bullet = bullet_scene.instance()

	# Shoot toward player
	var shoot_direction = (target.global_position - global_position).normalized()
	bullet.direction = shoot_direction

	# Heavy ranged enemies have slower, more powerful bullets
	if attack_type == AttackType.HEAVY_RANGED:
		bullet.damage = 15  # More damage than normal (normal is 10)
		bullet.speed = 80   # Slower bullet (easier to dodge)

	# Make bullet hostile to player (set to enemy team)
	bullet.is_enemy_bullet = true

	# Add bullet to scene FIRST (before setting position)
	get_parent().add_child(bullet)

	# Set bullet position AFTER adding to scene (this ensures global_position works correctly)
	bullet.global_position = global_position

	print("Bullet spawned at: ", bullet.global_position, " enemy at: ", global_position)

	# Start cooldown - Heavy ranged has longer cooldown
	var cooldown_time = shoot_cooldown
	if attack_type == AttackType.HEAVY_RANGED:
		cooldown_time = shoot_cooldown * 2.0  # Boss shoots half as often

	yield(get_tree().create_timer(cooldown_time), "timeout")
	can_shoot = true

# Melee attack function for MELEE enemies
func melee_attack_player():
	if not target:
		return

	can_melee = false

	# Deal damage to player via their hurtbox
	var player_hurtbox = target.get_node_or_null("Hurtbox")
	if player_hurtbox and player_hurtbox.has_method("take_damage"):
		player_hurtbox.take_damage(melee_damage, 100.0, global_position)
		print("Enemy ", name, " melee attacked player for ", melee_damage, " damage")

	# Visual feedback - flash or play attack animation
	if sprite and sprite is AnimatedSprite and sprite.frames.has_animation("attack"):
		sprite.play("attack")

	# Melee cooldown
	yield(get_tree().create_timer(melee_cooldown), "timeout")
	can_melee = true

# Helper to set patrol waypoints
func set_patrol_waypoints(waypoints: Array):
	patrol_points = waypoints

# Load all 8 directional sprite textures
func _load_directional_sprites():
	var directions = ["south", "south-east", "east", "north-east", "north", "north-west", "west", "south-west"]
	var dir_enums = [Direction.SOUTH, Direction.SOUTH_EAST, Direction.EAST, Direction.NORTH_EAST,
					 Direction.NORTH, Direction.NORTH_WEST, Direction.WEST, Direction.SOUTH_WEST]

	for i in range(directions.size()):
		var texture_path = sprite_base_path + directions[i] + ".png"
		var texture = load(texture_path)
		if texture:
			directional_textures[dir_enums[i]] = texture
		else:
			print("Warning: Could not load texture: ", texture_path)

	# Set initial direction
	_update_directional_sprite()

# Update sprite texture based on current direction
func _update_directional_sprite():
	if not use_directional_sprites or directional_textures.empty():
		return

	if sprite and directional_textures.has(current_direction):
		sprite.texture = directional_textures[current_direction]

# Calculate direction based on velocity and update sprite
func update_look_direction():
	if not use_directional_sprites:
		return

	if velocity_direction.length() < 0.1:
		return  # Not moving, keep current direction

	# Calculate angle from velocity (-PI to PI)
	var angle = velocity_direction.angle()

	# Convert angle to direction (8-way)
	# Normalize angle to 0-2PI range
	if angle < 0:
		angle += 2 * PI

	# Divide circle into 8 segments (each 45 degrees = PI/4)
	var segment = int(round(angle / (PI / 4))) % 8

	# Map segments to directions (starting from East = 0 radians, going counter-clockwise)
	match segment:
		0: current_direction = Direction.EAST
		1: current_direction = Direction.NORTH_EAST
		2: current_direction = Direction.NORTH
		3: current_direction = Direction.NORTH_WEST
		4: current_direction = Direction.WEST
		5: current_direction = Direction.SOUTH_WEST
		6: current_direction = Direction.SOUTH
		7: current_direction = Direction.SOUTH_EAST

	_update_directional_sprite()
