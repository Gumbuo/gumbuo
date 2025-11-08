extends Entity

class_name Player

# Weapon system
enum Weapon {PISTOL, RIFLE, SHOTGUN}
var current_weapon = Weapon.PISTOL

# Bullet scenes for each weapon
var bullet_pistol = preload("res://scenes/entity/bullet.tscn")
var bullet_rifle = preload("res://scenes/entity/bullet_rifle.tscn")
var bullet_shotgun = preload("res://scenes/entity/bullet_shotgun.tscn")

# Shooting variables
var can_shoot = true
var shoot_cooldown = 0.3  # Seconds between shots

# Audio
onready var shoot_sound = AudioStreamPlayer.new()

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
		current_weapon = Weapon.PISTOL
		print("Switched to PISTOL")
	elif event.is_action_pressed("ui_2") or (event is InputEventKey and event.scancode == KEY_2 and event.pressed):
		current_weapon = Weapon.RIFLE
		print("Switched to RIFLE")
	elif event.is_action_pressed("ui_3") or (event is InputEventKey and event.scancode == KEY_3 and event.pressed):
		current_weapon = Weapon.SHOTGUN
		print("Switched to SHOTGUN")

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

	# Select correct bullet scene based on current weapon
	var bullet_scene
	match current_weapon:
		Weapon.PISTOL:
			bullet_scene = bullet_pistol
		Weapon.RIFLE:
			bullet_scene = bullet_rifle
		Weapon.SHOTGUN:
			bullet_scene = bullet_shotgun

	# Create bullet
	var bullet = bullet_scene.instance()
	print("Bullet created for weapon: ", current_weapon)

	# Set bullet position to player position
	bullet.position = position

	# Shoot in the direction of the mouse cursor
	var mouse_position = get_global_mouse_position()
	var shoot_direction = (mouse_position - global_position).normalized()
	bullet.direction = shoot_direction
	print("Shooting toward mouse at: ", mouse_position, " direction: ", shoot_direction)

	# Add bullet to y_sort (same parent as player)
	get_parent().call_deferred("add_child", bullet)
	print("Bullet added to y_sort")

	# Start cooldown timer
	yield(get_tree().create_timer(shoot_cooldown), "timeout")
	can_shoot = true
