extends Entity

class_name Enemy

# Enemy AI with patrol, chase, and attack behaviors
# Based on Gumbuo Fighters combat system

enum State { IDLE, PATROL, CHASE, ATTACK, HURT, DEAD }
var current_state = State.IDLE

# AI Parameters
export var detection_range := 150.0
export var attack_range := 40.0
export var patrol_points := []
var current_patrol_index := 0

# Combat
export var attack_damage := 15
export var attack_cooldown := 1.5
var can_attack := true

# References
onready var health = $Health
onready var hurtbox = $Hurtbox
onready var attack_hitbox = $AttackHitbox
onready var detection_area = $DetectionArea
onready var attack_timer = $AttackTimer

var target: Player = null

func _ready():
	speed = 48  # Reduced from 64 to make enemies slower

	# Connect health signals
	health.connect("damaged", self, "_on_damaged")
	health.connect("died", self, "_on_died")

	# Connect hurtbox
	hurtbox.connect("hit_received", self, "_on_hit_received")

	# Setup attack timer
	attack_timer.wait_time = attack_cooldown
	attack_timer.one_shot = true
	attack_timer.connect("timeout", self, "_on_attack_cooldown_finished")

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
	elif patrol_points.size() > 0:
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

	# Close enough to attack
	if distance_to_target <= attack_range and can_attack:
		current_state = State.ATTACK
		return

	# Stop moving when within attack range to prevent collision freeze
	# This gives a small buffer zone to avoid physics conflicts
	if distance_to_target <= attack_range + 10:
		velocity_direction = Vector2.ZERO
		update_look_direction()
		return

	# Chase towards player
	var direction = (target.global_position - global_position).normalized()
	velocity_direction = direction
	update_look_direction()

func _state_attack():
	velocity_direction = Vector2.ZERO

	if not can_attack:
		current_state = State.CHASE
		return

	# Perform attack
	can_attack = false
	attack_timer.start()

	# Play attack animation
	sprite.play("punch")  # or "kick" randomly

	# Activate hitbox
	yield(get_tree().create_timer(0.2), "timeout")
	attack_hitbox.damage = attack_damage
	attack_hitbox.activate()

	yield(get_tree().create_timer(0.3), "timeout")
	attack_hitbox.deactivate()

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
	queue_free()

func _on_attack_cooldown_finished():
	can_attack = true

# Helper to set patrol waypoints
func set_patrol_waypoints(waypoints: Array):
	patrol_points = waypoints
