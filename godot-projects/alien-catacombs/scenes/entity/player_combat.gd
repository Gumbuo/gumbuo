extends Player

# Enhanced Player with Combat System
# This extends the basic Player class to add punch/kick attacks

# Combat states
enum CombatState { NONE, PUNCHING, KICKING }
var combat_state = CombatState.NONE
var can_attack := true

# Track last facing direction to prevent spinning
var last_facing_right := true

# References
onready var health = $Health
onready var hurtbox = $Hurtbox
onready var punch_hitbox = $PunchHitbox
onready var kick_hitbox = $KickHitbox

func _ready():
	._ready()  # Call parent _ready

	# Connect health signals
	health.connect("damaged", self, "_on_damaged")
	health.connect("died", self, "_on_died")

	# Connect hurtbox
	hurtbox.connect("hit_received", self, "_on_hit_received")

	# Connect hitbox signals
	punch_hitbox.connect("hit_landed", self, "_on_punch_landed")
	kick_hitbox.connect("hit_landed", self, "_on_kick_landed")

	# Set initial idle state to prevent spinning at start
	sprite.animation = "idle"
	sprite.frame = 0
	sprite.stop()
	sprite.flip_h = true  # Start facing right

func animation():
	# Don't override attack/hurt/dead animations
	if combat_state != CombatState.NONE:
		return

	# Determine if we're moving
	var is_moving = velocity_direction.length() > 0

	# Update facing direction based on actual input direction
	# Check input instead of velocity to avoid flipping during movement
	var moving_right = Input.is_action_pressed("move_right")
	var moving_left = Input.is_action_pressed("move_left")

	# Only change facing if there's clear directional input
	if moving_right and not moving_left:
		sprite.flip_h = true  # Face right
		last_facing_right = true
	elif moving_left and not moving_right:
		sprite.flip_h = false  # Face left
		last_facing_right = false
	# If both or neither are pressed, keep current facing

	# Handle animations
	if is_moving:
		# Play move animation only once when starting to move
		if sprite.animation != "move" or not sprite.playing:
			sprite.animation = "move"
			sprite.frame = 0
			sprite.play("move")
	else:
		# Use static idle frame to prevent spinning
		if sprite.animation != "idle" or sprite.playing:
			sprite.animation = "idle"
			sprite.frame = 0
			sprite.stop()

func _input(event):
	._input(event)  # Call parent input handling

	# Don't allow attacks while already attacking
	if combat_state != CombatState.NONE:
		return

	# Punch attack (X key or J key)
	if event.is_action_pressed("attack_punch"):
		perform_punch()

	# Kick attack (C key or K key)
	elif event.is_action_pressed("attack_kick"):
		perform_kick()

func perform_punch():
	if not can_attack:
		return

	combat_state = CombatState.PUNCHING
	can_attack = false

	# Play punch animation
	sprite.play("punch")

	# Flip hitbox position based on facing direction
	var punch_collision = punch_hitbox.get_node("collision_shape_2d")
	if sprite.flip_h:  # Facing right
		punch_collision.position.x = 20
	else:  # Facing left
		punch_collision.position.x = -20

	# Activate hitbox after a short delay (punch windup)
	yield(get_tree().create_timer(0.1), "timeout")
	punch_hitbox.activate()

	# Deactivate hitbox after punch duration
	yield(get_tree().create_timer(0.2), "timeout")
	punch_hitbox.deactivate()

	# End attack state
	yield(sprite, "animation_finished")
	combat_state = CombatState.NONE
	can_attack = true

func perform_kick():
	if not can_attack:
		return

	combat_state = CombatState.KICKING
	can_attack = false

	# Play kick animation
	sprite.play("kick")

	# Flip hitbox position based on facing direction
	var kick_collision = kick_hitbox.get_node("collision_shape_2d")
	if sprite.flip_h:  # Facing right
		kick_collision.position.x = 25
	else:  # Facing left
		kick_collision.position.x = -25

	# Activate hitbox after a short delay (kick windup)
	yield(get_tree().create_timer(0.15), "timeout")
	kick_hitbox.activate()

	# Deactivate hitbox after kick duration
	yield(get_tree().create_timer(0.25), "timeout")
	kick_hitbox.deactivate()

	# End attack state
	yield(sprite, "animation_finished")
	combat_state = CombatState.NONE
	can_attack = true

func _on_hit_received(damage: int, knockback_force: float, attacker_position: Vector2):
	health.take_damage(damage)

	# Apply knockback
	var knockback_direction = (global_position - attacker_position).normalized()
	velocity_direction = knockback_direction

	# Play hurt animation briefly, then allow movement again
	sprite.play("hurt")
	yield(get_tree().create_timer(0.3), "timeout")
	# Reset to normal animation
	if velocity_direction.length() > 0:
		sprite.play("move")
	else:
		sprite.play("idle")

func _on_damaged(amount):
	# Flash sprite or other visual feedback
	sprite.modulate = Color(1, 0.5, 0.5)  # Red tint
	yield(get_tree().create_timer(0.1), "timeout")
	sprite.modulate = Color(1, 1, 1)  # Back to normal

func _on_died():
	# Play death animation
	sprite.play("dead")
	velocity_direction = Vector2.ZERO
	set_physics_process(false)

func _on_punch_landed(target):
	print("Punch hit: ", target.name)

func _on_kick_landed(target):
	print("Kick hit: ", target.name)
