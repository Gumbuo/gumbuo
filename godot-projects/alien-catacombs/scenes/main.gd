extends Node2D

var vp_size:Vector2

var c_current_pos:Vector2=Vector2(0,0)

onready var player=$y_sort/player
onready var camera=$camera
onready var tween=$tween
onready var y_sort=$y_sort
onready var tile_map=$tile_map

# Enemy spawning
var enemy_scene = preload("res://scenes/entity/enemy.tscn")
var visited_rooms = []  # Track which rooms have been visited

func _ready():
	vp_size=get_viewport_rect().size

	# Initialize camera to player's starting room
	var p_pos:Vector2=(player.position/vp_size)
	var initial_cam_pos:=Vector2(int(p_pos.x),int(p_pos.y))*vp_size
	camera.position = initial_cam_pos
	c_current_pos = initial_cam_pos

	# Mark starting room as visited
	var room_key = Vector2(int(initial_cam_pos.x / vp_size.x), int(initial_cam_pos.y / vp_size.y))
	visited_rooms.append(room_key)
	# Notify GameStats for leaderboard tracking
	if GameStats:
		GameStats.add_room()

	# Completely disable camera limits
	camera.limit_left = -999999
	camera.limit_top = -999999
	camera.limit_right = 999999
	camera.limit_bottom = 999999
	camera.limit_smoothed = false

	# Wall collision re-enabled - user will work within camera bounds
	print("TileMap collision enabled - walls are solid")

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

func remove_boundary_walls():
	# Remove all wall tiles along x=0 and y=0 lines to allow room transitions
	# This removes the cross-shaped barrier at the origin

	# Get tile coordinates for x=0 line (vertical)
	for y in range(-50, 50):  # Check tiles from y=-50 to y=50
		var tile_coord = Vector2(0, y)
		tile_map.set_cellv(tile_coord, -1)  # -1 removes the tile

	# Get tile coordinates for y=0 line (horizontal)
	for x in range(-50, 50):  # Check tiles from x=-50 to x=50
		var tile_coord = Vector2(x, 0)
		tile_map.set_cellv(tile_coord, -1)  # -1 removes the tile

	print("Removed boundary walls at x=0 and y=0")

func spawn_enemies_in_room(room_pos: Vector2):
	# Check if we've already visited this room
	var room_key = Vector2(int(room_pos.x / vp_size.x), int(room_pos.y / vp_size.y))

	if room_key in visited_rooms:
		return  # Already spawned enemies here

	# Mark room as visited
	visited_rooms.append(room_key)
	# Notify GameStats for leaderboard tracking
	if GameStats:
		GameStats.add_room()

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
