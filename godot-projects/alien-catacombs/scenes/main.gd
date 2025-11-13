extends Node2D

var vp_size:Vector2

var c_current_pos:Vector2=Vector2(0,0)

onready var player=$y_sort/player
onready var camera=$camera
onready var tween=$tween
onready var y_sort=$y_sort
onready var tile_map=$tile_map
onready var game_over_screen=$GameOverScreen

# Enemy spawning - Multiple enemy types (9 total - NEW PixelLab enemies!)
var enemy_scenes = [
	preload("res://scenes/entity/enemy.tscn"),  # Keep enemy1 as requested
	preload("res://scenes/entity/enemy_jellyfish.tscn"),
	preload("res://scenes/entity/enemy_drone.tscn"),
	preload("res://scenes/entity/enemy_crawler.tscn"),
	preload("res://scenes/entity/enemy_turret_new.tscn"),
	preload("res://scenes/entity/enemy_slug.tscn"),
	preload("res://scenes/entity/enemy_ufo.tscn"),
	preload("res://scenes/entity/enemy_red_soldier.tscn"),
	preload("res://scenes/entity/enemy_boss_overlord.tscn")
]
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

	# Connect to player's Health component death signal
	var player_health = player.get_node_or_null("Health")
	if player_health:
		player_health.connect("died", self, "_on_player_died")
		print("Connected to player health - death handler ready")
	else:
		print("Warning: Player has no Health component!")

	# Hide game over screen initially
	if game_over_screen:
		game_over_screen.visible = false

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

	print("Attempting to spawn enemies in room: ", room_key)

	while spawned_count < 2 and spawn_attempts < 100:  # Increased attempts from 50 to 100
		spawn_attempts += 1

		# Generate random position in open areas (more centered, further from edges)
		var random_x = room_pos.x + rand_range(vp_size.x * 0.35, vp_size.x * 0.65)
		var random_y = room_pos.y + rand_range(vp_size.y * 0.35, vp_size.y * 0.65)
		var spawn_pos = Vector2(random_x, random_y)

		# Don't spawn too close to player (minimum 150 pixels away)
		var distance_to_player = spawn_pos.distance_to(player.position)
		if distance_to_player < 150:
			continue

		# Check if spawn position has collision (wall) or no tile (hole/pit)
		var tile_pos = tile_map.world_to_map(spawn_pos)
		var tile_id = tile_map.get_cellv(tile_pos)

		# Skip if there's no tile (hole/pit)
		if tile_id == -1:
			continue

		# Check if this tile is a wall (has collision shape) - only spawn on floor tiles
		var tile_set = tile_map.tile_set
		if tile_set.tile_get_shape_count(tile_id) > 0:
			# This tile has collision shapes, it's a wall - skip it
			continue

		# Also check surrounding tiles to ensure enough clearance (4 cardinal directions)
		var valid_surroundings = true
		for offset in [Vector2(0, -1), Vector2(0, 1), Vector2(-1, 0), Vector2(1, 0)]:
			var check_pos = tile_pos + offset
			var check_tile = tile_map.get_cellv(check_pos)

			# Skip if adjacent tile is a hole
			if check_tile == -1:
				valid_surroundings = false
				break

			# Skip if adjacent tile is a wall (has collision)
			if tile_set.tile_get_shape_count(check_tile) > 0:
				valid_surroundings = false
				break

		if not valid_surroundings:
			continue

		# All checks passed - this is a valid floor tile to spawn on!
		# Spawn the enemy - randomly select from available enemy types
		var random_enemy_scene = enemy_scenes[randi() % enemy_scenes.size()]
		var enemy = random_enemy_scene.instance()
		enemy.position = spawn_pos
		y_sort.add_child(enemy)

		spawned_count += 1
		print("Spawned enemy at: ", enemy.position, " (distance from player: ", int(distance_to_player), ")")

	# Report spawn results
	if spawned_count < 2:
		print("WARNING: Only spawned ", spawned_count, "/2 enemies after ", spawn_attempts, " attempts in room ", room_key)

func _on_player_died():
	print("Player died! Showing game over screen...")

	# Disable player movement and input
	player.set_physics_process(false)
	player.set_process_input(false)

	# Show game over screen
	if game_over_screen:
		game_over_screen.visible = true

	# Optionally pause enemies (make them stop attacking)
	get_tree().paused = true


func _on_Restart_pressed():
	pass # Replace with function body.
