extends CharacterBody3D

signal health_changed(new_health)
signal died

@export var player_num: int = 1
@export var speed: float = 4.5
@export var max_health: int = 100
@export var shoot_cooldown: float = 0.3
@export var melee_cooldown: float = 0.5
@export var melee_damage: int = 25
@export var melee_range: float = 2.0

var health: int = 100
var can_shoot: bool = true
var can_melee: bool = true
var is_dead: bool = false
var facing_direction: Vector3 = Vector3.FORWARD
var direction_name: String = "south"
var sprite_folder: String = "player1"

# Animation system
var current_anim: String = "breathing-idle"
var anim_frames: Array = []
var anim_frame: int = 0
var anim_timer: float = 0.0
var anim_speed: float = 0.18
var is_attacking: bool = false
var attack_timer: float = 0.0

@onready var sprite: Sprite3D = $Sprite3D
@onready var shoot_timer: Timer = $ShootTimer
@onready var melee_timer: Timer = $MeleeTimer
@onready var melee_area: Area3D = $MeleeArea

# Input action prefixes
var up_action: String
var down_action: String
var left_action: String
var right_action: String
var shoot_action: String
var melee_action: String

func _ready():
	health = max_health
	sprite_folder = "player1" if player_num == 1 else "player2"

	# Set up input actions based on player number
	var prefix = "p" + str(player_num) + "_"
	up_action = prefix + "up"
	down_action = prefix + "down"
	left_action = prefix + "left"
	right_action = prefix + "right"
	shoot_action = prefix + "shoot"
	melee_action = prefix + "melee"

	# Connect timers
	shoot_timer.timeout.connect(_on_shoot_timer_timeout)
	melee_timer.timeout.connect(_on_melee_timer_timeout)
	shoot_timer.wait_time = shoot_cooldown
	melee_timer.wait_time = melee_cooldown

	# Load initial animation
	load_animation("breathing-idle", "south")

func load_animation(anim_name: String, dir_name: String):
	anim_frames.clear()

	# Fix player 2 east/west swap
	var actual_dir = dir_name
	if player_num == 2:
		match dir_name:
			"east": actual_dir = "west"
			"west": actual_dir = "east"
			"north-east": actual_dir = "north-west"
			"north-west": actual_dir = "north-east"
			"south-east": actual_dir = "south-west"
			"south-west": actual_dir = "south-east"

	var base_path = "res://assets/sprites/" + sprite_folder + "/animations/" + anim_name + "/" + actual_dir + "/"

	# Try to load frames 0-15 (most animations have 4-10 frames)
	for i in range(16):
		var frame_path = base_path + "frame_%03d.png" % i
		if ResourceLoader.exists(frame_path):
			anim_frames.append(load(frame_path))
		else:
			break

	# If no animation found, try static rotation image
	if anim_frames.size() == 0:
		var static_path = "res://assets/sprites/" + sprite_folder + "/rotations/" + actual_dir + ".png"
		if ResourceLoader.exists(static_path):
			anim_frames.append(load(static_path))

	# Reset frame counter
	anim_frame = 0
	anim_timer = 0.0
	if anim_frames.size() > 0:
		sprite.texture = anim_frames[0]

func update_animation(delta):
	if anim_frames.size() <= 1:
		return

	anim_timer += delta
	if anim_timer >= anim_speed:
		anim_timer = 0.0
		anim_frame = (anim_frame + 1) % anim_frames.size()
		sprite.texture = anim_frames[anim_frame]

func set_animation(anim_name: String):
	if current_anim != anim_name or is_attacking:
		current_anim = anim_name
		load_animation(anim_name, direction_name)

func _physics_process(delta):
	if is_dead:
		return

	# Update animation
	update_animation(delta)

	# Handle attack timer
	if is_attacking:
		attack_timer -= delta
		if attack_timer <= 0:
			is_attacking = false
			# Return to idle or walk animation
			if velocity.length() > 0.1:
				set_animation("walking-8-frames")
			else:
				set_animation("breathing-idle")

	# Get input direction
	var input_dir = Vector3.ZERO

	if Input.is_action_pressed(up_action):
		input_dir.z -= 1
	if Input.is_action_pressed(down_action):
		input_dir.z += 1
	if Input.is_action_pressed(left_action):
		input_dir.x -= 1
	if Input.is_action_pressed(right_action):
		input_dir.x += 1

	# Normalize and apply velocity
	if input_dir != Vector3.ZERO:
		input_dir = input_dir.normalized()
		facing_direction = input_dir
		velocity = input_dir * speed

		# Update direction and animation
		update_direction_name()
		if not is_attacking:
			set_animation("walking-8-frames")
	else:
		velocity = velocity.move_toward(Vector3.ZERO, speed * delta * 10)
		if not is_attacking and velocity.length() < 0.1:
			set_animation("breathing-idle")

	move_and_slide()

	# Player 1 aims with mouse (for shooting direction)
	if player_num == 1:
		var camera = get_viewport().get_camera_3d()
		if camera:
			var mouse_pos = get_viewport().get_mouse_position()
			var from = camera.project_ray_origin(mouse_pos)
			var plane = Plane(Vector3.UP, 0)
			var intersection = plane.intersects_ray(from, camera.project_ray_normal(mouse_pos))
			if intersection:
				var look_dir = (intersection - global_position).normalized()
				look_dir.y = 0
				if look_dir.length() > 0.1:
					facing_direction = look_dir.normalized()
					update_direction_name()
					if not is_attacking:
						load_animation(current_anim, direction_name)

	# Handle shooting
	if Input.is_action_pressed(shoot_action) and can_shoot:
		shoot()

	# Handle melee
	if Input.is_action_just_pressed(melee_action) and can_melee:
		melee_attack()

func update_direction_name():
	# Use atan2(z, x) for proper screen-space angles
	# 0° = right (east), 90° = down (south), 180° = left (west), 270° = up (north)
	var angle = atan2(facing_direction.z, facing_direction.x)
	var deg = rad_to_deg(angle)
	if deg < 0:
		deg += 360

	var new_direction = "east"
	if deg >= 337.5 or deg < 22.5:
		new_direction = "east"       # 0° = right
	elif deg >= 22.5 and deg < 67.5:
		new_direction = "south-east" # 45° = down-right
	elif deg >= 67.5 and deg < 112.5:
		new_direction = "south"      # 90° = down
	elif deg >= 112.5 and deg < 157.5:
		new_direction = "south-west" # 135° = down-left
	elif deg >= 157.5 and deg < 202.5:
		new_direction = "west"       # 180° = left
	elif deg >= 202.5 and deg < 247.5:
		new_direction = "north-west" # 225° = up-left
	elif deg >= 247.5 and deg < 292.5:
		new_direction = "north"      # 270° = up
	elif deg >= 292.5 and deg < 337.5:
		new_direction = "north-east" # 315° = up-right

	if new_direction != direction_name:
		direction_name = new_direction
		load_animation(current_anim, direction_name)

func shoot():
	can_shoot = false
	shoot_timer.start()

	# Play attack animation
	is_attacking = true
	attack_timer = 0.4
	set_animation("fireball")

	# Create projectile
	var projectile = preload("res://scenes/projectile.tscn").instantiate()
	projectile.global_position = global_position + Vector3(0, 0.5, 0)
	projectile.direction = facing_direction
	projectile.shooter = self
	get_tree().root.add_child(projectile)

func melee_attack():
	can_melee = false
	melee_timer.start()

	# Play attack animation
	is_attacking = true
	attack_timer = 0.5
	set_animation("cross-punch")

	# Check for enemies in melee range
	for body in melee_area.get_overlapping_bodies():
		if body != self and body.has_method("take_damage"):
			body.take_damage(melee_damage, self)

func take_damage(amount: int, attacker = null):
	if is_dead:
		return

	health -= amount
	health_changed.emit(health)

	# Flash red
	sprite.modulate = Color.RED
	await get_tree().create_timer(0.1).timeout
	sprite.modulate = Color.WHITE

	if health <= 0:
		die()

func die():
	is_dead = true
	died.emit()
	# Respawn after delay
	await get_tree().create_timer(2.0).timeout
	respawn()

func respawn():
	is_dead = false
	health = max_health
	health_changed.emit(health)

	# Move to spawn point
	if player_num == 1:
		global_position = Vector3(-5, 0.5, 0)
	else:
		global_position = Vector3(5, 0.5, 0)

	set_animation("breathing-idle")

func _on_shoot_timer_timeout():
	can_shoot = true

func _on_melee_timer_timeout():
	can_melee = true
