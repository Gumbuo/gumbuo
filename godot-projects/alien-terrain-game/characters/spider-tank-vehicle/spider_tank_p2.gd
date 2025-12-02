extends CharacterBody2D

class_name SpiderTankP2

# Movement
@export var speed: float = 250.0

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

@onready var sprite: Sprite2D = $Sprite2D
@onready var shoot_timer: Timer = $ShootTimer

# Direction sprites
var direction_textures: Dictionary = {}

func _ready():
	add_to_group("player")
	add_to_group("player2")
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

	# Tint P2 tank red
	sprite.modulate = Color(1.0, 0.6, 0.6)

	update_sprite_direction(Vector2.DOWN)

	if shoot_timer:
		shoot_timer.wait_time = fire_rate
		shoot_timer.one_shot = true
		shoot_timer.timeout.connect(_on_shoot_timer_timeout)

func _physics_process(_delta):
	# Player 2 uses Arrow Keys
	var input_dir = Vector2.ZERO

	if Input.is_key_pressed(KEY_UP):
		input_dir.y -= 1
	if Input.is_key_pressed(KEY_DOWN):
		input_dir.y += 1
	if Input.is_key_pressed(KEY_LEFT):
		input_dir.x -= 1
	if Input.is_key_pressed(KEY_RIGHT):
		input_dir.x += 1

	velocity = input_dir.normalized() * speed
	move_and_slide()

	if input_dir.length() > 0.1:
		update_sprite_direction(input_dir)

	# Player 2 shoots with Enter/Return or Right Ctrl
	if Input.is_key_pressed(KEY_ENTER) or Input.is_key_pressed(KEY_KP_ENTER) or Input.is_key_pressed(KEY_CTRL):
		shoot()

func update_sprite_direction(dir: Vector2):
	var angle = dir.angle()
	var direction_name = get_direction_from_angle(angle)

	if direction_name != current_direction and direction_textures.has(direction_name):
		current_direction = direction_name
		sprite.texture = direction_textures[direction_name]

func get_direction_from_angle(angle: float) -> String:
	var deg = rad_to_deg(angle)
	if deg < 0:
		deg += 360

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
	else:
		return "north_east"

func shoot():
	if not can_shoot:
		return

	can_shoot = false
	shoot_timer.start()

	# Shoot in facing direction
	var shoot_direction = get_direction_vector()

	if bullet_scene:
		var bullet = bullet_scene.instantiate()
		bullet.global_position = global_position + shoot_direction * 30
		bullet.direction = shoot_direction
		bullet.rotation = shoot_direction.angle()
		bullet.add_to_group("p2_bullet")
		get_tree().current_scene.add_child(bullet)

func get_direction_vector() -> Vector2:
	match current_direction:
		"north": return Vector2.UP
		"south": return Vector2.DOWN
		"east": return Vector2.RIGHT
		"west": return Vector2.LEFT
		"north_east": return Vector2(1, -1).normalized()
		"north_west": return Vector2(-1, -1).normalized()
		"south_east": return Vector2(1, 1).normalized()
		"south_west": return Vector2(-1, 1).normalized()
	return Vector2.DOWN

func _on_shoot_timer_timeout():
	can_shoot = true

func take_damage(amount: int):
	health -= amount
	health_changed.emit(health)
	# Flash red
	sprite.modulate = Color(1, 0, 0)
	await get_tree().create_timer(0.1).timeout
	sprite.modulate = Color(1.0, 0.6, 0.6)

	if health <= 0:
		die()

func die():
	print("Player 2 destroyed!")
	died.emit()
	queue_free()
