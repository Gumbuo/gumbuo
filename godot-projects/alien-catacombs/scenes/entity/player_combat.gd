extends Player

# Enhanced Player with Combat System
# This extends the basic Player class to add punch/kick attacks

# Combat states
enum CombatState { NONE, PUNCHING, KICKING }
var combat_state = CombatState.NONE
var can_attack := true

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

func animation():
	# Don't override attack/hurt/dead animations
	if combat_state != CombatState.NONE:
		return

	# Play idle or move animation
	if velocity_direction.length() > 0:
		if sprite.animation != "move":
			sprite.play("move")
	else:
		if sprite.animation != "idle":
			sprite.play("idle")

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
