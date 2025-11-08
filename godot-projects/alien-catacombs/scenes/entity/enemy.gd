extends Entity

class_name Enemy

# Enemy AI with patrol, chase, and attack behaviors
# Based on Gumbuo Fighters combat system

enum State { IDLE, PATROL, CHASE, ATTACK, HURT, DEAD }
var current_state = State.IDLE

# AI Parameters
export var detection_range := 150.0
export var patrol_points := []
var current_patrol_index := 0
export var is_stationary := false  # Stationary enemies don't move, only shoot

# Shooting attack (all enemies shoot now)
export var shoot_range := 120.0  # Distance from which enemy starts shooting
var bullet_scene = preload("res://scenes/entity/bullet.tscn")
var shoot_cooldown := 1.0
var can_shoot := true

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

func animation():
	# Don't override attack/hurt/dead animations
	if current_state == State.ATTACK or current_state == State.HURT or current_state == State.DEAD:
		return

	# Play idle animation by default
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

	._physics_process(delta)  # Call parent movement

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
		current_state = State.IDLE
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
		if distance_to_target <= shoot_range and can_shoot:
			current_state = State.ATTACK
		return

	# Keep distance and shoot
	if distance_to_target <= shoot_range and can_shoot:
		velocity_direction = Vector2.ZERO
		current_state = State.ATTACK
		return
	# Move closer if too far
	elif distance_to_target > shoot_range:
		var direction = (target.global_position - global_position).normalized()
		velocity_direction = direction
		update_look_direction()
	# Maintain distance
	else:
		velocity_direction = Vector2.ZERO
		update_look_direction()

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

	# Apply knockback
	var knockback_direction = (global_position - attacker_position).normalized()
	velocity_direction = knockback_direction * 2

	# Play hurt animation and enter hurt state
	sprite.play("hurt")
	current_state = State.HURT

func _on_damaged(amount):
	# Visual feedback - flash red
	sprite.modulate = Color(1, 0.3, 0.3)
	yield(get_tree().create_timer(0.1), "timeout")
	sprite.modulate = Color(1, 1, 1)

func _on_died():
	current_state = State.DEAD
	velocity_direction = Vector2.ZERO

	# Play death animation
	sprite.play("dead")

	# Disable collision
	$collision_shape_2d.set_deferred("disabled", true)

	# Remove after death animation
	yield(sprite, "animation_finished")
	# Notify GameStats for leaderboard tracking
	if GameStats:
		GameStats.add_kill()
	queue_free()

# Shooting function for all enemies
func shoot_at_player():
	if not target:
		return

	can_shoot = false

	# Create bullet
	var bullet = bullet_scene.instance()

	# Set bullet position
	bullet.global_position = global_position

	# Shoot toward player
	var shoot_direction = (target.global_position - global_position).normalized()
	bullet.direction = shoot_direction

	# Make bullet hostile to player (set to enemy team)
	bullet.is_enemy_bullet = true

	# Add bullet to scene
	get_parent().add_child(bullet)

	# Start cooldown
	yield(get_tree().create_timer(shoot_cooldown), "timeout")
	can_shoot = true

# Helper to set patrol waypoints
func set_patrol_waypoints(waypoints: Array):
	patrol_points = waypoints
