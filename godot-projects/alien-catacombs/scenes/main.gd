extends Node2D

var vp_size:Vector2

var c_current_pos:Vector2=Vector2(0,0)

onready var player=$y_sort/player
onready var camera=$camera
onready var tween=$tween
onready var y_sort=$y_sort

# Enemy spawning
var enemy_scene = preload("res://scenes/entity/enemy.tscn")
var visited_rooms = []  # Track which rooms have been visited

func _ready():
	vp_size=get_viewport_rect().size
	# Mark starting room as visited
	visited_rooms.append(Vector2(0, 0))

func _process(delta):
	move_camera()

func move_camera():
	var p_pos:Vector2=(player.position/vp_size)
	var c_true_pos:Vector2=camera.position
	var c_pos:=Vector2(int(p_pos.x),int(p_pos.y))*vp_size
	if c_pos!=c_current_pos:
		tween.interpolate_property(camera,"position",c_true_pos,c_pos,0.3,Tween.TRANS_CUBIC,Tween.EASE_IN_OUT)
		tween.start()
		c_current_pos=c_pos

		# Spawn enemies when entering a new room
		spawn_enemies_in_room(c_pos)

func spawn_enemies_in_room(room_pos: Vector2):
	# Check if we've already visited this room
	var room_key = Vector2(int(room_pos.x / vp_size.x), int(room_pos.y / vp_size.y))

	if room_key in visited_rooms:
		return  # Already spawned enemies here

	# Mark room as visited
	visited_rooms.append(room_key)

	# Spawn 2 enemies at safe positions within the room
	var spawn_attempts = 0
	var spawned_count = 0

	while spawned_count < 2 and spawn_attempts < 50:
		spawn_attempts += 1

		# Generate random position in open areas (center of room, away from edges)
		var random_x = room_pos.x + rand_range(vp_size.x * 0.3, vp_size.x * 0.7)
		var random_y = room_pos.y + rand_range(vp_size.y * 0.3, vp_size.y * 0.7)
		var spawn_pos = Vector2(random_x, random_y)

		# Don't spawn too close to player (minimum 150 pixels away)
		var distance_to_player = spawn_pos.distance_to(player.position)
		if distance_to_player < 150:
			continue

		# Spawn the enemy
		var enemy = enemy_scene.instance()
		enemy.position = spawn_pos
		y_sort.add_child(enemy)

		spawned_count += 1
		print("Spawned enemy at: ", enemy.position, " (distance from player: ", int(distance_to_player), ")")
