extends Enemy

# Boss Overlord - Heavy ranged attacker with full directional animations
# Walk, Attack (fireball), and Hurt animations for all 8 directions

func _ready():
	# Disable old directional sprite system (we're using AnimatedSprite now)
	use_directional_sprites = false

	._ready()

	# Configure as HEAVY_RANGED enemy
	attack_type = AttackType.HEAVY_RANGED
	shoot_range = 180.0  # Long range
	shoot_cooldown = 2.5  # Slow but powerful shots

	# Boss stats - tough and strong
	speed = 35  # Slow movement
	detection_range = 200.0  # Wide detection

func _physics_process(delta):
	._physics_process(delta)  # Call parent physics
	animation()  # Update animation every frame

# Override animation to use directional animations
func animation():
	if not sprite or not sprite is AnimatedSprite:
		return

	# Get direction suffix based on movement
	var dir_suffix = _get_direction_suffix()

	# Play appropriate animation based on state
	match current_state:
		State.ATTACK:
			var anim_name = "attack_" + dir_suffix
			if sprite.frames.has_animation(anim_name):
				if sprite.animation != anim_name:
					sprite.play(anim_name)
		State.HURT:
			# Only play hurt animation once, then let it finish
			var anim_name = "hurt_" + dir_suffix
			if sprite.frames.has_animation(anim_name):
				if sprite.animation != anim_name or not sprite.playing:
					sprite.play(anim_name)
		State.DEAD:
			# Don't override dead state
			return
		_:
			# Walking or idle - play walk animation (but not during hurt recovery)
			if current_state != State.HURT:
				var anim_name = "walk_" + dir_suffix
				if sprite.frames.has_animation(anim_name):
					if sprite.animation != anim_name:
						sprite.play(anim_name)

# Get direction suffix based on velocity_direction
func _get_direction_suffix() -> String:
	if velocity_direction.length() < 0.1:
		return _angle_to_direction(get_angle_to(target.global_position) if target else 0)

	var angle = velocity_direction.angle()
	return _angle_to_direction(angle)

# Convert angle to direction string
func _angle_to_direction(angle: float) -> String:
	# Normalize angle to 0-2PI
	angle = wrapf(angle, 0, TAU)

	# Convert to degrees for easier comparison
	var degrees = rad2deg(angle)

	# 8-direction mapping (45 degree segments)
	if degrees >= 337.5 or degrees < 22.5:
		return "east"
	elif degrees >= 22.5 and degrees < 67.5:
		return "south_east"
	elif degrees >= 67.5 and degrees < 112.5:
		return "south"
	elif degrees >= 112.5 and degrees < 157.5:
		return "south_west"
	elif degrees >= 157.5 and degrees < 202.5:
		return "west"
	elif degrees >= 202.5 and degrees < 247.5:
		return "north_west"
	elif degrees >= 247.5 and degrees < 292.5:
		return "north"
	else:  # 292.5 to 337.5
		return "north_east"
