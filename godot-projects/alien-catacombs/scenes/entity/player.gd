extends Entity

class_name Player

# Weapon system
enum Weapon {RIFLE, SHOTGUN}
var current_weapon = Weapon.RIFLE

# Bullet scenes for each weapon
var bullet_rifle = preload("res://scenes/entity/bullet_rifle.tscn")
var bullet_shotgun = preload("res://scenes/entity/bullet_shotgun.tscn")

# Shooting variables
var can_shoot = true
var is_shooting = false  # Track if mouse button is held down

# Audio
onready var shoot_sound = AudioStreamPlayer.new()

# New directional sprite logic
var sprite_paths = {
    "south": preload("res://godot-projects/alien-catacombs/sprites/green_alien_player/rotations/south.png"),
    "north": preload("res://godot-projects/alien-catacombs/sprites/green_alien_player/rotations/north.png"),
    "east": preload("res://godot-projects/alien-catacombs/sprites/green_alien_player/rotations/east.png"),
    "west": preload("res://godot-projects/alien-catacombs/sprites/green_alien_player/rotations/west.png"),
    "south-east": preload("res://godot-projects/alien-catacombs/sprites/green_alien_player/rotations/south-east.png"),
    "south-west": preload("res://godot-projects/alien-catacombs/sprites/green_alien_player/rotations/south-west.png"),
    "north-east": preload("res://godot-projects/alien-catacombs/sprites/green_alien_player/rotations/north-east.png"),
    "north-west": preload("res://godot-projects/alien-catacombs/sprites/green_alien_player/rotations/north-west.png")
}

onready var sprite = $sprite
var current_direction = "south"


func _ready():
	speed=96

	# Setup shoot sound
	var stream = load("res://asset/sounds/7f15794c712fa02ecaf70e0037e2b5678dc500111c7713bc055ba30f3a7012a8-PlayerDeathSoundEffect.ogg")
	stream.loop = false  # Explicitly disable looping
	shoot_sound.stream = stream
	shoot_sound.volume_db = -5
	shoot_sound.bus = "Master"
	add_child(shoot_sound)

func _input(event):

	if event.is_action_pressed("move_down"):
		velocity_direction.y=1
	elif event.is_action_released("move_down"):
		if velocity_direction.y==1:
			velocity_direction.y=0
	if event.is_action_pressed("move_up"):
		velocity_direction.y=-1
	elif event.is_action_released("move_up"):
		if velocity_direction.y==-1:
			velocity_direction.y=0
	if event.is_action_pressed("move_left"):
		velocity_direction.x=-1
	elif event.is_action_released("move_left"):
		if velocity_direction.x==-1:
			velocity_direction.x=0
	if event.is_action_pressed("move_right"):
		velocity_direction.x=1
	elif event.is_action_released("move_right"):
		if velocity_direction.x==1:
			velocity_direction.x=0

	# Weapon switching
	if event.is_action_pressed("ui_1") or (event is InputEventKey and event.scancode == KEY_1 and event.pressed):
		current_weapon = Weapon.RIFLE
		print("Switched to RIFLE")
	elif event.is_action_pressed("ui_2") or (event is InputEventKey and event.scancode == KEY_2 and event.pressed):
		current_weapon = Weapon.SHOTGUN
		print("Switched to SHOTGUN")

	# Shooting input
	if event.is_action_pressed("shoot"):
		is_shooting = true
		shoot()
	elif event.is_action_released("shoot"):
		is_shooting = false

	update_look_direction()

func _physics_process(delta):
	# Continuous fire for rifle when mouse is held
	if is_shooting and current_weapon == Weapon.RIFLE and can_shoot:
		shoot()
	
	update_sprite_direction(velocity)


func update_sprite_direction(velocity: Vector2):
    if velocity.length() == 0:
        return

    var angle = velocity.angle()
    var direction = ""

    # Convert angle to direction (8-way)
    if angle >= -PI/8 and angle < PI/8:
        direction = "east"
    elif angle >= PI/8 and angle < 3*PI/8:
        direction = "south-east"
    elif angle >= 3*PI/8 and angle < 5*PI/8:
        direction = "south"
    elif angle >= 5*PI/8 and angle < 7*PI/8:
        direction = "south-west"
    elif angle >= 7*PI/8 or angle < -7*PI/8:
        direction = "west"
    elif angle >= -7*PI/8 and angle < -5*PI/8:
        direction = "north-west"
    elif angle >= -5*PI/8 and angle < -3*PI/8:
        direction = "north"
    elif angle >= -3*PI/8 and angle < -PI/8:
        direction = "north-east"

    if direction != current_direction:
        current_direction = direction
        sprite.texture = sprite_paths[direction]

func shoot():
	print("Shoot button pressed!")
	if not can_shoot:
		print("Still on cooldown")
		return

	can_shoot = false

	# Play shoot sound (don't stop - let it finish naturally to avoid echo)
	shoot_sound.play()

	# Get mouse position and base direction
	var mouse_position = get_global_mouse_position()
	var shoot_direction = (mouse_position - global_position).normalized()

	# Select correct bullet scene and cooldown based on current weapon
	var bullet_scene
	var cooldown
	var pellet_count = 1  # Number of bullets to spawn
	var spread_angle = 0.0  # Spread angle in degrees

	match current_weapon:
		Weapon.RIFLE:
			bullet_scene = bullet_rifle
			cooldown = 0.1  # Fast fire rate for rapid shooting
		Weapon.SHOTGUN:
			bullet_scene = bullet_shotgun
			cooldown = 0.5  # Slower reload for shotgun
			pellet_count = 5  # Fire 5 pellets
			spread_angle = 30.0  # 30 degree spread

	# Create bullets (single for pistol/rifle, multiple for shotgun)
	for i in range(pellet_count):
		var bullet = bullet_scene.instance()
		# Track shot for stats
		if GameStats:
			GameStats.add_shot_fired()
		bullet.position = position

		# Calculate spread for shotgun
		if pellet_count > 1:
			# Spread pellets evenly across the spread angle
			var angle_offset = -spread_angle/2 + (spread_angle / (pellet_count - 1)) * i
			var angle_rad = deg2rad(angle_offset)

			# Rotate the shoot direction by the angle offset
			var rotated_dir = Vector2(
				shoot_direction.x * cos(angle_rad) - shoot_direction.y * sin(angle_rad),
				shoot_direction.x * sin(angle_rad) + shoot_direction.y * cos(angle_rad)
			)
			bullet.direction = rotated_dir
		else:
			bullet.direction = shoot_direction

		# Add bullet to y_sort (same parent as player)
		get_parent().call_deferred("add_child", bullet)

	print("Bullet(s) created for weapon: ", current_weapon)

	# Start cooldown timer with weapon-specific cooldown
	yield(get_tree().create_timer(cooldown), "timeout")
	can_shoot = true
