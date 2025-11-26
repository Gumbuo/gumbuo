tool
extends EditorScript

# Run this script in the Godot editor via Script > Run (Ctrl+Shift+X)
# It will create a SpriteFrames resource for the Green Alien Player

const BASE_PATH = "res://asset/characters/green_alien_player/animations/"

const ANIMATIONS = [
	"backflip",
	"breathing-idle",
	"cross-punch",
	"crouching",
	"drinking",
	"falling-back-death",
	"fireball",
	"flying-kick",
	"front-flip",
	"getting-up",
	"high-kick",
	"hurricane-kick",
	"lead-jab",
	"leg-sweep",
	"picking-up",
	"pull-heavy-object",
	"pushing",
	"roundhouse-kick",
	"running-jump",
	"running-slide",
	"surprise-uppercut",
	"taking-punch",
	"throw-object",
	"two-footed-jump",
	"walk",
	"walking-10",
	"walking-8-frames"
]

const DIRECTIONS = [
	"south",
	"south-west",
	"west",
	"north-west",
	"north",
	"north-east",
	"east",
	"south-east"
]

# Animation speeds (adjust as needed)
const ANIM_SPEEDS = {
	"breathing-idle": 8.0,
	"walk": 10.0,
	"walking-8-frames": 12.0,
	"walking-10": 12.0,
	"cross-punch": 15.0,
	"lead-jab": 15.0,
	"high-kick": 12.0,
	"roundhouse-kick": 12.0,
	"hurricane-kick": 12.0,
	"leg-sweep": 12.0,
	"flying-kick": 12.0,
	"surprise-uppercut": 15.0,
	"taking-punch": 10.0,
	"falling-back-death": 8.0,
	"getting-up": 8.0,
	"two-footed-jump": 10.0,
	"running-jump": 10.0,
	"running-slide": 10.0,
	"crouching": 8.0,
	"pushing": 10.0,
	"pull-heavy-object": 10.0,
	"picking-up": 10.0,
	"drinking": 8.0,
	"throw-object": 12.0,
	"fireball": 12.0,
	"backflip": 12.0,
	"front-flip": 12.0
}

# Which animations should loop
const LOOPING_ANIMS = [
	"breathing-idle",
	"walk",
	"walking-8-frames",
	"walking-10",
	"pushing",
	"pull-heavy-object"
]

func _run():
	print("Creating Green Alien SpriteFrames...")

	var sprite_frames = SpriteFrames.new()

	# Remove default animation
	if sprite_frames.has_animation("default"):
		sprite_frames.remove_animation("default")

	var total_anims = 0

	for anim_name in ANIMATIONS:
		for direction in DIRECTIONS:
			var full_anim_name = anim_name + "_" + direction.replace("-", "_")

			# Get all frames for this animation/direction
			var frames = get_frames_for_animation(anim_name, direction)

			if frames.size() > 0:
				sprite_frames.add_animation(full_anim_name)

				# Set animation speed
				var speed = ANIM_SPEEDS.get(anim_name, 10.0)
				sprite_frames.set_animation_speed(full_anim_name, speed)

				# Set looping
				var should_loop = anim_name in LOOPING_ANIMS
				sprite_frames.set_animation_loop(full_anim_name, should_loop)

				# Add frames
				for frame in frames:
					sprite_frames.add_frame(full_anim_name, frame)

				total_anims += 1

	# Save the resource
	var save_path = "res://asset/characters/green_alien_player/green_alien_spriteframes.tres"
	var error = ResourceSaver.save(save_path, sprite_frames)

	if error == OK:
		print("SUCCESS! Created SpriteFrames with " + str(total_anims) + " animations")
		print("Saved to: " + save_path)
	else:
		print("ERROR saving SpriteFrames: " + str(error))

func get_frames_for_animation(anim_name: String, direction: String) -> Array:
	var frames = []
	var dir_path = BASE_PATH + anim_name + "/" + direction + "/"

	# Try loading frames sequentially
	var frame_num = 0
	while true:
		var frame_path = dir_path + "frame_%03d.png" % frame_num

		if ResourceLoader.exists(frame_path):
			var texture = load(frame_path)
			if texture:
				frames.append(texture)
			frame_num += 1
		else:
			break

	return frames
