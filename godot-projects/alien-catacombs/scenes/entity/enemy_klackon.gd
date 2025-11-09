extends Entity

class_name EnemyKlackon

# Simplified enemy AI for sprite-based enemies (Klackon variants)
# Uses Sprite instead of AnimatedSprite

enum State { IDLE, PATROL, CHASE, ATTACK, HURT, DEAD }
var current_state = State.IDLE

# AI Parameters
export var detection_range := 150.0
export var patrol_points := []
var current_patrol_index := 0
export var is_stationary := false

# Shooting attack
export var shoot_range := 120.0
var bullet_scene = preload("res://scenes/entity/bullet.tscn")
var shoot_cooldown := 1.0
var can_shoot := true

# References
onready var health = $Health
onready var hurtbox = $Hurtbox
onready var detection_area = $DetectionArea

var target: Player = null

# Animation variables
var animation_timer := 0.0
var animation_speed := 8.0  # Frames per second
var current_frame := 0
var total_frames := 5  # Default - will be overridden by subclasses if needed

func _ready():
	speed = 48

	# Connect health signals
	health.connect("damaged", self, "_on_damaged")
	health.connect("died", self, "_on_died")

	# Connect hurtbox
	hurtbox.connect("hit_received", self, "_on_hit_received")

	# Start with random frame for variety
	current_frame = randi() % total_frames
	if sprite:
		sprite.frame = current_frame

func animation():
	# Animate sprite frames
	if not sprite:
		return

	animation_timer += get_physics_process_delta_time()

	if animation_timer >= 1.0 / animation_speed:
		animation_timer = 0.0
		current_frame = (current_frame + 1) % total_frames
		sprite.frame = current_frame

func _physics_process(delta):
	if current_state == State.DEAD:
		return

	# Animate sprite
	animation()

	match current_state:
		State.IDLE:
			_state_idle()
		State.CHASE:
			_state_chase()
		State.ATTACK:
			_state_attack()

func _state_idle():
	# Look for player
	find_target()

	if target:
		current_state = State.CHASE

func _state_chase():
	if not target or not is_instance_valid(target):
		target = null
		current_state = State.IDLE
		return

	var distance_to_target = position.distance_to(target.position)

	# If in shooting range, start attacking
	if distance_to_target <= shoot_range:
		current_state = State.ATTACK
		return

	# If target too far, go back to idle
	if distance_to_target > detection_range * 1.5:
		target = null
		current_state = State.IDLE
		return

	# Move towards target
	var direction = (target.position - position).normalized()
	velocity_direction = direction

func _state_attack():
	# Klackon enemies don't shoot - they just chase
	# If close enough, just stay near the player
	if not target or not is_instance_valid(target):
		target = null
		current_state = State.IDLE
		return

	var distance_to_target = position.distance_to(target.position)

	# If target moved out of range, chase again
	if distance_to_target > shoot_range * 1.2:
		current_state = State.CHASE
		return

	# Stop moving when close - Klackon doesn't shoot
	velocity_direction = Vector2.ZERO

func find_target():
	# Simple detection - find player if close enough
	var players = get_tree().get_nodes_in_group("player")
	if players.size() > 0:
		var player = players[0]
		if position.distance_to(player.position) <= detection_range:
			target = player

func shoot_at_target():
	if not target:
		return

	can_shoot = false

	# Create bullet
	var bullet = bullet_scene.instance()
	bullet.position = position
	bullet.direction = (target.position - position).normalized()
	bullet.is_enemy_bullet = true
	get_parent().add_child(bullet)

	# Cooldown
	yield(get_tree().create_timer(shoot_cooldown), "timeout")
	can_shoot = true

func _on_damaged(amount):
	# Flash sprite or show damage
	if sprite:
		sprite.modulate = Color(1, 0.5, 0.5)
		yield(get_tree().create_timer(0.1), "timeout")
		if sprite and is_instance_valid(sprite):
			sprite.modulate = Color(1, 1, 1)

func _on_died():
	current_state = State.DEAD
	set_physics_process(false)

	# Fade out and remove
	if sprite:
		sprite.modulate = Color(0.5, 0.5, 0.5, 0.5)

	yield(get_tree().create_timer(0.5), "timeout")
	queue_free()

func _on_hit_received(damage):
	health.take_damage(damage)
