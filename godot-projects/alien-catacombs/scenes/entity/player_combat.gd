extends Player

# Enhanced Player with Combat System
# This extends the basic Player class to add kick attacks with random animations

# Combat states
enum CombatState { NONE, PUNCHING, KICKING }
var combat_state = CombatState.NONE
var can_attack := true

# Attack animation types - randomly selected
const KICK_TYPES = ["high-kick", "roundhouse-kick", "leg-sweep", "hurricane-kick"]
const PUNCH_TYPES = ["cross-punch", "lead-jab", "surprise-uppercut"]

# Cache for animation frames
var kick_animations = {}
var punch_animations = {}
var walk_animations = {}
var is_loading_animations = false
var is_loading_punches = false
var is_loading_walk = false

# Track current animation state
var current_kick_type = ""
var current_punch_type = ""
var current_frame = 0
var animation_timer = 0.0
var walk_frame = 0
var walk_timer = 0.0
var frames_per_second = 12.0  # Animation speed
var time_per_frame = 1.0 / frames_per_second
var is_walking = false

# Original sprite texture (to restore after animation)
var original_sprite_texture = null

# References (using get_node_or_null to avoid errors if nodes don't exist)
onready var health = get_node_or_null("Health")
onready var hurtbox = get_node_or_null("Hurtbox")
onready var kick_hitbox = get_node_or_null("KickHitbox")
onready var punch_hitbox = get_node_or_null("PunchHitbox")

func _ready():
	._ready()  # Call parent _ready

	# Store original sprite reference
	original_sprite_texture = sprite.texture

	# Connect health signals
	if health:
		health.connect("damaged", self, "_on_damaged")
		health.connect("died", self, "_on_died")

	# Connect hurtbox
	if hurtbox:
		hurtbox.connect("hit_received", self, "_on_hit_received")

	# Connect hitbox signals
	if kick_hitbox:
		kick_hitbox.connect("hit_landed", self, "_on_kick_landed")
	if punch_hitbox:
		punch_hitbox.connect("hit_landed", self, "_on_punch_landed")

	# Load animations in background
	call_deferred("load_kick_animations")
	call_deferred("load_punch_animations")
	call_deferred("load_walk_animations")

func load_kick_animations():
	if is_loading_animations:
		return
	is_loading_animations = true

	print("Loading kick animations...")

	# Load all kick types for all directions
	for kick_type in KICK_TYPES:
		kick_animations[kick_type] = {}

		for direction in ["south", "north", "east", "west", "south-east", "south-west", "north-east", "north-west"]:
			var frames = []
			var frame_index = 0
			var base_path = "res://sprites/green_alien_player/animations/" + kick_type + "/" + direction + "/frame_"

			# Load all frames for this direction
			while true:
				var frame_path = base_path + "%03d" % frame_index + ".png"
				var texture = load(frame_path)
				if texture == null:
					break
				frames.append(texture)
				frame_index += 1

			kick_animations[kick_type][direction] = frames
			if frame_index > 0:
				print("  Loaded ", frame_index, " frames for ", kick_type, " ", direction)

	is_loading_animations = false
	print("Kick animations loaded!")

func load_punch_animations():
	if is_loading_punches:
		return
	is_loading_punches = true

	print("Loading punch animations...")

	# Load all punch types for all directions
	for punch_type in PUNCH_TYPES:
		punch_animations[punch_type] = {}

		for direction in ["south", "north", "east", "west", "south-east", "south-west", "north-east", "north-west"]:
			var frames = []
			var frame_index = 0
			var base_path = "res://sprites/green_alien_player/animations/" + punch_type + "/" + direction + "/frame_"

			# Load all frames for this direction
			while true:
				var frame_path = base_path + "%03d" % frame_index + ".png"
				var texture = load(frame_path)
				if texture == null:
					break
				frames.append(texture)
				frame_index += 1

			punch_animations[punch_type][direction] = frames
			if frame_index > 0:
				print("  Loaded ", frame_index, " frames for ", punch_type, " ", direction)

	is_loading_punches = false
	print("Punch animations loaded!")

func load_walk_animations():
	if is_loading_walk:
		return
	is_loading_walk = true

	print("Loading walk animations...")

	# Load walking animation for all directions
	for direction in ["south", "north", "east", "west", "south-east", "south-west", "north-east", "north-west"]:
		var frames = []
		var frame_index = 0
		var base_path = "res://sprites/green_alien_player/animations/walking-10/" + direction + "/frame_"

		# Load all frames for this direction
		while true:
			var frame_path = base_path + "%03d" % frame_index + ".png"
			var texture = load(frame_path)
			if texture == null:
				break
			frames.append(texture)
			frame_index += 1

		walk_animations[direction] = frames
		if frame_index > 0:
			print("  Loaded ", frame_index, " walk frames for ", direction)

	is_loading_walk = false
	print("Walk animations loaded!")

func _physics_process(delta):
	._physics_process(delta)

	# Update kick animation if playing
	if combat_state == CombatState.KICKING and current_kick_type != "":
		animation_timer += delta

		if animation_timer >= time_per_frame:
			animation_timer = 0.0
			current_frame += 1

			# Check if animation finished
			var frames = kick_animations[current_kick_type].get(current_direction, [])
			if current_frame >= frames.size():
				# Animation complete - restore normal sprite
				combat_state = CombatState.NONE
				can_attack = true
				current_kick_type = ""
				current_frame = 0
				walk_frame = 0
				# Restore direction-based sprite
				if sprite_paths.has(current_direction):
					sprite.texture = sprite_paths[current_direction]
			else:
				# Update sprite to next frame
				sprite.texture = frames[current_frame]

	# Update punch animation if playing
	elif combat_state == CombatState.PUNCHING and current_punch_type != "":
		animation_timer += delta

		if animation_timer >= time_per_frame:
			animation_timer = 0.0
			current_frame += 1

			# Check if animation finished
			var frames = punch_animations[current_punch_type].get(current_direction, [])
			if current_frame >= frames.size():
				# Animation complete - restore normal sprite
				combat_state = CombatState.NONE
				can_attack = true
				current_punch_type = ""
				current_frame = 0
				walk_frame = 0
				# Restore direction-based sprite
				if sprite_paths.has(current_direction):
					sprite.texture = sprite_paths[current_direction]
			else:
				# Update sprite to next frame
				sprite.texture = frames[current_frame]

	# Handle walking animation when not attacking
	elif combat_state == CombatState.NONE:
		var is_moving = velocity_direction.length() > 0.1

		if is_moving and walk_animations.has(current_direction):
			# Play walk animation
			walk_timer += delta

			if walk_timer >= time_per_frame:
				walk_timer = 0.0
				var frames = walk_animations[current_direction]
				if frames.size() > 0:
					walk_frame = (walk_frame + 1) % frames.size()
					sprite.texture = frames[walk_frame]
		else:
			# Show idle sprite (static rotation sprite)
			walk_frame = 0
			walk_timer = 0.0
			if sprite_paths.has(current_direction):
				sprite.texture = sprite_paths[current_direction]

func _input(event):
	# Debug all mouse button events
	if event is InputEventMouseButton:
		print("Mouse button event: button=", event.button_index, " pressed=", event.pressed)
		print("  Is attack_kick action? ", event.is_action_pressed("attack_kick"))

	# Don't allow attacks while already attacking
	if combat_state != CombatState.NONE:
		print("Cannot process input - in combat state: ", combat_state)
		._input(event)  # Still call parent
		return

	# Kick attack (Right Mouse Button)
	if event.is_action_pressed("attack_kick"):
		print("Right-click detected! Attempting kick...")
		perform_random_kick()
		return  # Don't pass to parent if we handled it

	# Punch attack (Space key)
	if event.is_action_pressed("attack_punch"):
		print("Punch button detected! Attempting punch...")
		perform_random_punch()
		return  # Don't pass to parent if we handled it

	._input(event)  # Call parent input handling for other events

func perform_random_kick():
	if not can_attack or is_loading_animations:
		print("Cannot attack - can_attack:", can_attack, " is_loading:", is_loading_animations)
		return

	# Randomly select a kick type
	randomize()
	var kick_index = randi() % KICK_TYPES.size()
	current_kick_type = KICK_TYPES[kick_index]

	print("Performing ", current_kick_type, " in direction ", current_direction)

	# Check if we have frames for this kick type and direction
	if not kick_animations.has(current_kick_type):
		print("ERROR: Kick type not loaded: ", current_kick_type)
		return

	if not kick_animations[current_kick_type].has(current_direction):
		print("ERROR: Direction not found for ", current_kick_type, ": ", current_direction)
		return

	var frames = kick_animations[current_kick_type][current_direction]
	if frames.size() == 0:
		print("ERROR: Empty frame array for ", current_kick_type, " ", current_direction)
		return

	# Start kick animation
	combat_state = CombatState.KICKING
	can_attack = false
	current_frame = 0
	animation_timer = 0.0

	# Set first frame
	sprite.texture = frames[0]

	# Activate hitbox after a short delay (kick windup)
	var hitbox_delay = max(2, frames.size() / 3) * time_per_frame
	yield(get_tree().create_timer(hitbox_delay), "timeout")
	if kick_hitbox and combat_state == CombatState.KICKING:
		kick_hitbox.activate()

	# Deactivate hitbox after kick hits
	var hitbox_active_time = max(2, frames.size() / 3) * time_per_frame
	yield(get_tree().create_timer(hitbox_active_time), "timeout")
	if kick_hitbox:
		kick_hitbox.deactivate()

func perform_random_punch():
	if not can_attack or is_loading_punches:
		print("Cannot punch - can_attack:", can_attack, " is_loading:", is_loading_punches)
		return

	# Randomly select a punch type
	randomize()
	var punch_index = randi() % PUNCH_TYPES.size()
	current_punch_type = PUNCH_TYPES[punch_index]

	print("Performing ", current_punch_type, " in direction ", current_direction)

	# Check if we have frames for this punch type and direction
	if not punch_animations.has(current_punch_type):
		print("ERROR: Punch type not loaded: ", current_punch_type)
		return

	if not punch_animations[current_punch_type].has(current_direction):
		print("ERROR: Direction not found for ", current_punch_type, ": ", current_direction)
		return

	var frames = punch_animations[current_punch_type][current_direction]
	if frames.size() == 0:
		print("ERROR: Empty frame array for ", current_punch_type, " ", current_direction)
		return

	# Start punch animation
	combat_state = CombatState.PUNCHING
	can_attack = false
	current_frame = 0
	animation_timer = 0.0

	# Set first frame
	sprite.texture = frames[0]

	# Activate hitbox after a short delay (punch windup)
	var hitbox_delay = max(2, frames.size() / 3) * time_per_frame
	yield(get_tree().create_timer(hitbox_delay), "timeout")
	if punch_hitbox and combat_state == CombatState.PUNCHING:
		punch_hitbox.activate()

	# Deactivate hitbox after punch hits
	var hitbox_active_time = max(2, frames.size() / 3) * time_per_frame
	yield(get_tree().create_timer(hitbox_active_time), "timeout")
	if punch_hitbox:
		punch_hitbox.deactivate()

func _on_hit_received(damage: int, knockback_force: float, attacker_position: Vector2):
	if health:
		health.take_damage(damage)

	# Apply knockback
	var knockback_direction = (global_position - attacker_position).normalized()
	velocity_direction = knockback_direction

	# Brief stun
	yield(get_tree().create_timer(0.3), "timeout")

func _on_damaged(amount):
	# Flash sprite
	sprite.modulate = Color(1, 0.5, 0.5)  # Red tint
	yield(get_tree().create_timer(0.1), "timeout")
	sprite.modulate = Color(1, 1, 1)  # Back to normal

func _on_died():
	# Stop movement
	velocity_direction = Vector2.ZERO
	set_physics_process(false)
	print("Player died!")

func _on_kick_landed(target):
	print("KICK HIT: ", target.name, " with ", current_kick_type, "!")

func _on_punch_landed(target):
	print("PUNCH HIT: ", target.name, " with ", current_punch_type, "!")
