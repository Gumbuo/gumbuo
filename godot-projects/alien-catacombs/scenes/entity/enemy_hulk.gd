extends Enemy

# Hulk enemy - shoots at player from range
# Tough ranged enemy with slower fire rate

func _ready():
	._ready()
	# Hulk is a heavy ranged attacker
	shoot_range = 100.0
	shoot_cooldown = 0.6  # Much faster fire rate
	speed = 35  # Slower movement
	detection_range = 180.0  # Better detection

# Override animation - Hulk uses Sprite not AnimatedSprite
func animation():
	pass  # No animation for now

# Override hit received - no animation for Sprite
func _on_hit_received(damage: int, knockback_force: float, attacker_position: Vector2):
	if current_state == State.DEAD:
		return

	health.take_damage(damage)

	# Apply knockback
	var knockback_direction = (global_position - attacker_position).normalized()
	velocity_direction = knockback_direction * 2

	# No animation for Sprite - just enter hurt state
	current_state = State.HURT

# Override died - no animation for Sprite
func _on_died():
	current_state = State.DEAD
	velocity_direction = Vector2.ZERO

	# Disable collision
	$collision_shape.set_deferred("disabled", true)

	# Fade out
	if sprite:
		sprite.modulate = Color(0.5, 0.5, 0.5, 0.5)

	# Remove after delay
	yield(get_tree().create_timer(0.5), "timeout")
	if GameStats:
		GameStats.add_kill()
	queue_free()
