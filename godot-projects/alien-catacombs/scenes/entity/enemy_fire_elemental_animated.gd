extends Enemy

# Fire Elemental - Ranged attacker with FULL ANIMATIONS

var sprite_frames: SpriteFrames
var is_loading_animations := false

# Animation configurations
const ANIMATIONS = {
	"breathing-idle": {"fps": 8, "loop": true},
	"walking-8-frames": {"fps": 10, "loop": true},
	"fireball": {"fps": 10, "loop": false},
	"taking-punch": {"fps": 10, "loop": false},
}

const DIRECTIONS = ["south", "north", "east", "west", "south-east", "south-west", "north-east", "north-west"]

func _ready():
	._ready()

	# Configure as RANGED enemy
	attack_type = AttackType.RANGED
	shoot_range = 140.0
	shoot_cooldown = 1.2

	# Fire Elemental stats
	speed = 40
	detection_range = 160.0

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
	print("Fire Elemental animations loaded!")

func _load_animation_frames(anim_name: String, direction: String) -> Array:
	var frames = []
	var frame_index = 0
	var base_path = "res://sprites/fire_elemental/animations/" + anim_name + "/" + direction + "/frame_"

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
	_update_animation()

func _update_animation():
	if not sprite or not sprite is AnimatedSprite or is_loading_animations:
		return

	var dir_suffix = _get_direction_suffix()

	# Play appropriate animation based on state
	match current_state:
		State.ATTACK:
			var anim_name = "fireball_" + dir_suffix
			if sprite.frames.has_animation(anim_name):
				if sprite.animation != anim_name or not sprite.playing:
					sprite.play(anim_name)
		State.HURT:
			var anim_name = "taking-punch_" + dir_suffix
			if sprite.frames.has_animation(anim_name):
				if sprite.animation != anim_name or not sprite.playing:
					sprite.play(anim_name)
		_:
			# Walking or idle
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
