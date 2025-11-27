extends Enemy

# Yellow Ghost - Melee attacker with FULL ANIMATIONS

var sprite_frames: SpriteFrames
var is_loading_animations := false

# Animation configurations
const ANIMATIONS = {
	"breathing-idle": {"fps": 8, "loop": true},
	"walking-8-frames": {"fps": 10, "loop": true},
	"cross-punch": {"fps": 12, "loop": false},
	"lead-jab": {"fps": 12, "loop": false},
	"high-kick": {"fps": 12, "loop": false},
	"taking-punch": {"fps": 10, "loop": false},
}

const DIRECTIONS = ["south", "north", "east", "west", "south-east", "south-west", "north-east", "north-west"]

# Track current attack animation
var current_attack_anim := 0
var attack_animations = ["cross-punch", "lead-jab", "high-kick"]

func _ready():
	._ready()

	# Configure as MELEE enemy
	attack_type = AttackType.MELEE
	melee_range = 20.0
	melee_damage = 12
	melee_cooldown = 1.0

	# Yellow Ghost stats
	speed = 45
	detection_range = 180.0

	# Load animations
	call_deferred("_load_animations")

func _load_animations():
	if is_loading_animations:
		return
	is_loading_animations = true

	# Create SpriteFrames
	sprite_frames = SpriteFrames.new()

	# Load idle animation (breathing-idle south)
	var idle_frames = _load_animation_frames("breathing-idle", "south")
	if idle_frames.size() > 0:
		sprite_frames.add_animation("idle")
		sprite_frames.set_animation_speed("idle", 8)
		sprite_frames.set_animation_loop("idle", true)
		for frame in idle_frames:
			sprite_frames.add_frame("idle", frame)

	# Load all directional animations
	for anim_name in ANIMATIONS.keys():
		var config = ANIMATIONS[anim_name]
		for direction in DIRECTIONS:
			var frames = _load_animation_frames(anim_name, direction)
			if frames.size() == 0:
				continue

			var dir_suffix = direction.replace("-", "_")
			var full_name = anim_name + "_" + dir_suffix

			sprite_frames.add_animation(full_name)
			sprite_frames.set_animation_speed(full_name, config.fps)
			sprite_frames.set_animation_loop(full_name, config.loop)

			for frame in frames:
				sprite_frames.add_frame(full_name, frame)

			# Add "attack" alias for cross-punch so base Enemy code can find it
			if anim_name == "cross-punch":
				# Non-directional "attack" for melee
				if direction == "south":
					sprite_frames.add_animation("attack")
					sprite_frames.set_animation_speed("attack", config.fps)
					sprite_frames.set_animation_loop("attack", config.loop)
					for frame in frames:
						sprite_frames.add_frame("attack", frame)

	# Replace Sprite with AnimatedSprite
	if sprite and sprite is Sprite:
		var old_sprite = sprite
		var animated_sprite = AnimatedSprite.new()
		animated_sprite.name = "sprite"
		animated_sprite.frames = sprite_frames
		animated_sprite.animation = "idle"
		animated_sprite.playing = true

		add_child(animated_sprite)
		old_sprite.queue_free()
		sprite = animated_sprite

	is_loading_animations = false
	print("Yellow Ghost animations loaded!")

func _load_animation_frames(anim_name: String, direction: String) -> Array:
	var frames = []
	var frame_index = 0
	var base_path = "res://sprites/yellow_ghost/animations/" + anim_name + "/" + direction + "/frame_"

	while true:
		var frame_path = base_path + "%03d" % frame_index + ".png"
		var texture = load(frame_path)
		if texture == null:
			break
		frames.append(texture)
		frame_index += 1

	return frames

func _physics_process(delta):
	._physics_process(delta)
	_update_walking_animation()

func _update_walking_animation():
	# Only update walking/idle - let base Enemy handle attack animations
	if not sprite or not sprite is AnimatedSprite or is_loading_animations:
		return

	# Don't override if attack or hurt animation is playing
	if sprite.animation == "attack" or sprite.animation.begins_with("cross-punch") or sprite.animation.begins_with("lead-jab") or sprite.animation.begins_with("high-kick") or sprite.animation.begins_with("taking-punch"):
		return

	var dir_suffix = _get_direction_suffix()

	# Walking or idle only
	if velocity_direction.length() > 0.1:
		var anim_name = "walking-8-frames_" + dir_suffix
		if sprite.frames.has_animation(anim_name):
			if sprite.animation != anim_name:
				sprite.play(anim_name)
	else:
		if sprite.animation != "idle":
			sprite.play("idle")

func _get_direction_suffix() -> String:
	if velocity_direction.length() < 0.1:
		# Use last known direction or default to south
		return "south"

	var angle = velocity_direction.angle()
	return _angle_to_direction(angle)

func _angle_to_direction(angle: float) -> String:
	angle = wrapf(angle, 0, TAU)
	var degrees = rad2deg(angle)

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
	else:
		return "north_east"

# Override melee attack function to use correct animation names
func melee_attack_player():
	if not target:
		return

	print("Yellow Ghost melee attacking! Playing punch/kick animation")
	can_melee = false

	# Play one of the melee attack animations
	if sprite and sprite is AnimatedSprite:
		var angle = (target.global_position - global_position).angle()
		var dir_suffix = _angle_to_direction(angle)
		var attack_anim = attack_animations[current_attack_anim % attack_animations.size()]
		var full_anim = attack_anim + "_" + dir_suffix

		if sprite.frames.has_animation(full_anim):
			sprite.play(full_anim)
			yield(get_tree().create_timer(0.2), "timeout")

		current_attack_anim += 1

	# Deal damage to player via their hurtbox
	var player_hurtbox = target.get_node_or_null("Hurtbox")
	if player_hurtbox and player_hurtbox.has_method("take_damage"):
		player_hurtbox.take_damage(melee_damage, 100.0, global_position)

	yield(get_tree().create_timer(melee_cooldown), "timeout")
	can_melee = true
