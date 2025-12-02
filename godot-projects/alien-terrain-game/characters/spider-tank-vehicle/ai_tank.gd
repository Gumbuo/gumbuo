extends CharacterBody2D

class_name AITank

# Movement
@export var speed: float = 150.0
@export var detection_range: float = 500.0
@export var attack_range: float = 300.0

# Shooting
@export var bullet_scene: PackedScene
@export var fire_rate: float = 0.8
var can_shoot: bool = true

# Health
var health: int = 80
var max_health: int = 80

# AI State
enum State { IDLE, PATROL, CHASE, ATTACK }
var current_state: State = State.PATROL
var target: Node2D = null
var patrol_timer: float = 0.0
var patrol_direction: Vector2 = Vector2.RIGHT

# Current direction for animation
var current_direction: String = "south"

@onready var sprite: Sprite2D = $Sprite2D
@onready var shoot_timer: Timer = $ShootTimer

# Direction sprites
var direction_textures: Dictionary = {}

func _ready():
	add_to_group("enemy")
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

	# Tint enemy tank purple/blue
	sprite.modulate = Color(0.7, 0.5, 1.0)

	update_sprite_direction(Vector2.DOWN)

	if shoot_timer:
		shoot_timer.wait_time = fire_rate
		shoot_timer.one_shot = true
		shoot_timer.timeout.connect(_on_shoot_timer_timeout)

	# Random initial patrol direction
	patrol_direction = Vector2(randf_range(-1, 1), randf_range(-1, 1)).normalized()

func _physics_process(delta):
	find_target()

	match current_state:
		State.IDLE:
			idle_behavior(delta)
		State.PATROL:
			patrol_behavior(delta)
		State.CHASE:
			chase_behavior(delta)
		State.ATTACK:
			attack_behavior(delta)

	move_and_slide()

func find_target():
	# Find nearest player
	var players = get_tree().get_nodes_in_group("player")
	var nearest_dist = INF
	target = null

	for player in players:
		if player == self:
			continue
		if player.is_in_group("enemy"):
			continue
		var dist = global_position.distance_to(player.global_position)
		if dist < nearest_dist:
			nearest_dist = dist
			target = player

	# Update state based on target distance
	if target:
		if nearest_dist <= attack_range:
			current_state = State.ATTACK
		elif nearest_dist <= detection_range:
			current_state = State.CHASE
		else:
			current_state = State.PATROL
	else:
		current_state = State.PATROL

func idle_behavior(_delta):
	velocity = Vector2.ZERO

func patrol_behavior(delta):
	patrol_timer += delta

	# Change direction every 2-4 seconds
	if patrol_timer > randf_range(2.0, 4.0):
		patrol_timer = 0.0
		patrol_direction = Vector2(randf_range(-1, 1), randf_range(-1, 1)).normalized()

	velocity = patrol_direction * speed * 0.5

	if velocity.length() > 0.1:
		update_sprite_direction(velocity)

func chase_behavior(_delta):
	if not target:
		current_state = State.PATROL
		return

	var direction = (target.global_position - global_position).normalized()
	velocity = direction * speed

	update_sprite_direction(direction)

func attack_behavior(_delta):
	if not target:
		current_state = State.PATROL
		return

	var direction = (target.global_position - global_position).normalized()

	# Strafe while attacking
	var strafe = Vector2(-direction.y, direction.x) * sin(Time.get_ticks_msec() * 0.002)
	velocity = strafe * speed * 0.3

	update_sprite_direction(direction)
	shoot_at_target()

func shoot_at_target():
	if not can_shoot or not target:
		return

	can_shoot = false
	shoot_timer.start()

	var shoot_direction = (target.global_position - global_position).normalized()

	if bullet_scene:
		var bullet = bullet_scene.instantiate()
		bullet.global_position = global_position + shoot_direction * 30
		bullet.direction = shoot_direction
		bullet.rotation = shoot_direction.angle()
		bullet.add_to_group("enemy_bullet")
		# Tint enemy bullets
		if bullet.has_node("ColorRect"):
			bullet.get_node("ColorRect").color = Color(1, 0.3, 1)
		get_tree().current_scene.add_child(bullet)

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

func _on_shoot_timer_timeout():
	can_shoot = true

func take_damage(amount: int):
	health -= amount
	# Flash white
	sprite.modulate = Color(1, 1, 1)
	await get_tree().create_timer(0.1).timeout
	sprite.modulate = Color(0.7, 0.5, 1.0)

	if health <= 0:
		die()

func die():
	print("Enemy tank destroyed!")
	# Could spawn explosion effect here
	queue_free()
