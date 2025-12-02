extends CharacterBody2D

class_name SpiderTank

# Movement
@export var speed: float = 250.0
@export var rotation_speed: float = 5.0

# Shooting
@export var bullet_scene: PackedScene
@export var fire_rate: float = 0.2
var can_shoot: bool = true

# Health
var health: int = 100
var max_health: int = 100

signal health_changed(new_health)
signal died

# Current direction for animation
var current_direction: String = "south"
var last_velocity: Vector2 = Vector2.ZERO

@onready var sprite: Sprite2D = $Sprite2D
@onready var shoot_timer: Timer = $ShootTimer
@onready var muzzle: Marker2D = $Muzzle

# Direction sprites - load on ready
var direction_textures: Dictionary = {}

func _ready():
	add_to_group("player")
	add_to_group("tank")

	# Load all 8 direction textures
	var base_path = "res://characters/spider-tank-vehicle/"
	direction_textures = {
		"north": load(base_path + "spider_tank_north.png"),
		"south": load(base_path + "spider_tank_south.png"),
		"east": load(base_path + "spider_tank_east.png"),
		"west": load(base_path + "spider_tank_west.png"),
		"north_east": load(base_path + "spider_tank_north_east.png"),
		"north_west": load(base_path + "spider_tank_north_west.png"),
		"south_east": load(base_path + "spider_tank_south_east.png"),
		"south_west": load(base_path + "spider_tank_south_west.png"),
	}

	# Set initial sprite
	update_sprite_direction(Vector2.DOWN)

	# Setup shoot timer
	if shoot_timer:
		shoot_timer.wait_time = fire_rate
		shoot_timer.one_shot = true
		shoot_timer.timeout.connect(_on_shoot_timer_timeout)

func _physics_process(delta):
	# Get input direction
	var input_dir = Input.get_vector("ui_left", "ui_right", "ui_up", "ui_down")

	# Also check WASD if not mapped
	if input_dir == Vector2.ZERO:
		input_dir = Vector2(
			Input.get_action_strength("move_right") - Input.get_action_strength("move_left"),
			Input.get_action_strength("move_down") - Input.get_action_strength("move_up")
		)

	# Set velocity
	velocity = input_dir.normalized() * speed

	# Move the tank
	move_and_slide()

	# Update sprite based on movement direction
	if input_dir.length() > 0.1:
		update_sprite_direction(input_dir)
		last_velocity = input_dir

	# Handle shooting
	if Input.is_action_pressed("shoot") or Input.is_mouse_button_pressed(MOUSE_BUTTON_LEFT):
		shoot()

func update_sprite_direction(dir: Vector2):
	# Determine which of the 8 directions to use
	var angle = dir.angle()
	var direction_name = get_direction_from_angle(angle)

	if direction_name != current_direction and direction_textures.has(direction_name):
		current_direction = direction_name
		sprite.texture = direction_textures[direction_name]

func get_direction_from_angle(angle: float) -> String:
	# Convert angle to degrees and normalize to 0-360
	var deg = rad_to_deg(angle)
	if deg < 0:
		deg += 360

	# 8-direction mapping (22.5 degree sectors)
	# Right = 0°, Down = 90°, Left = 180°, Up = 270°
	if deg >= 337.5 or deg < 22.5:
		return "east"
	elif deg >= 22.5 and deg < 67.5:
		return "south_east"
	elif deg >= 67.5 and deg < 112.5:
		return "south"
	elif deg >= 112.5 and deg < 157.5:
		return "south_west"
	elif deg >= 157.5 and deg < 202.5:
		return "west"
	elif deg >= 202.5 and deg < 247.5:
		return "north_west"
	elif deg >= 247.5 and deg < 292.5:
		return "north"
	else:  # 292.5 to 337.5
		return "north_east"

func shoot():
	if not can_shoot:
		return

	can_shoot = false
	shoot_timer.start()

	# Get direction to mouse
	var mouse_pos = get_global_mouse_position()
	var shoot_direction = (mouse_pos - global_position).normalized()

	# Create bullet
	if bullet_scene:
		var bullet = bullet_scene.instantiate()
		bullet.global_position = global_position
		bullet.direction = shoot_direction
		bullet.rotation = shoot_direction.angle()
		get_tree().current_scene.add_child(bullet)
		print("Tank fired!")

func _on_shoot_timer_timeout():
	can_shoot = true

# For vehicle system compatibility
func set_can_move(value: bool):
	set_physics_process(value)

func take_damage(amount: int):
	health -= amount
	health_changed.emit(health)
	# Flash red
	sprite.modulate = Color(1, 0.3, 0.3)
	await get_tree().create_timer(0.1).timeout
	sprite.modulate = Color(1, 1, 1)

	if health <= 0:
		die()

func die():
	print("Player 1 destroyed!")
	died.emit()
	queue_free()
