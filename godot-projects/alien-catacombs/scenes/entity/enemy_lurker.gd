extends Enemy

# Lurker enemy - shoots at player from range
# Fast ranged attacker with quick fire rate

func _ready():
	._ready()
	# Lurker is EXTREMELY DANGEROUS
	shoot_range = 130.0  # Longer range
	shoot_cooldown = 0.3  # INSANE fire rate!
	speed = 65  # Fastest enemy by far!
	detection_range = 200.0  # Tracks you from very far away

# Override animation - Lurker uses Sprite not AnimatedSprite
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
