extends Entity

class_name Player

# Shooting variables
var bullet_scene = preload("res://scenes/entity/bullet.tscn")
var can_shoot = true
var shoot_cooldown = 0.3  # Seconds between shots

# Audio
onready var shoot_sound = AudioStreamPlayer.new()

func _ready():
	speed=96

	# Setup shoot sound
	shoot_sound.stream = load("res://asset/sounds/7f15794c712fa02ecaf70e0037e2b5678dc500111c7713bc055ba30f3a7012a8-PlayerDeathSoundEffect.ogg")
	shoot_sound.volume_db = -5
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

	# Shooting input
	if event.is_action_pressed("shoot"):
		shoot()

	update_look_direction()
func animation():
#	match look_direction:
#		Vector2.UP:
#			sprite.play("idle_back")
#		Vector2.DOWN:
#			sprite.play("idle_front")
#		Vector2.LEFT:
#			sprite.play("idle_left")
#		Vector2.RIGHT:
#			sprite.play("idle_right")
	pass

func shoot():
	print("Shoot button pressed!")
	if not can_shoot:
		print("Still on cooldown")
		return

	can_shoot = false

	# Stop any previous sound and play shoot sound
	if shoot_sound.is_playing():
		shoot_sound.stop()
	shoot_sound.play()

	# Create bullet
	var bullet = bullet_scene.instance()
	print("Bullet created")

	# Set bullet position to player position
	bullet.global_position = global_position

	# Shoot in the direction of the mouse cursor
	var mouse_position = get_global_mouse_position()
	var shoot_direction = (mouse_position - global_position).normalized()
	bullet.direction = shoot_direction
	print("Shooting toward mouse at: ", mouse_position, " direction: ", shoot_direction)

	# Add bullet to the scene (parent's parent to add to main scene)
	get_parent().add_child(bullet)
	print("Bullet added to scene")

	# Start cooldown timer
	yield(get_tree().create_timer(shoot_cooldown), "timeout")
	can_shoot = true
