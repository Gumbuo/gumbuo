extends "res://scenes/main.gd"

# Multiplayer support
var network_player_scene = preload("res://scenes/entity/player.tscn")
var players = {}  # Dictionary of player_id -> player node
var local_player = null

func _ready():
	# Skip parent _ready if in multiplayer mode
	if get_tree().network_peer:
		vp_size = get_viewport_rect().size

		# Setup camera
		camera.limit_left = -999999
		camera.limit_top = -999999
		camera.limit_right = 999999
		camera.limit_bottom = 999999
		camera.limit_smoothed = false

		# Connect network signals
		NetworkManager.connect("player_connected", self, "_on_player_connected")
		NetworkManager.connect("player_disconnected", self, "_on_player_disconnected")

		# Remove the default player from scene (we'll spawn network players)
		if has_node("y_sort/player"):
			$y_sort/player.queue_free()

		# Spawn players for all connected peers
		yield(get_tree(), "idle_frame")  # Wait one frame for scene to initialize
		spawn_all_players()

		print("Multiplayer mode initialized - TileMap collision enabled")
	else:
		# Single player mode - call parent
		._ready()

func _process(delta):
	if local_player and is_instance_valid(local_player):
		# Follow local player instead of "player"
		player = local_player
		move_camera()
	elif get_tree().network_peer == null:
		# Single player mode
		._process(delta)

func spawn_all_players():
	print("Spawning players for all connected peers")

	# Spawn players for everyone in the game
	for player_id in NetworkManager.players:
		spawn_player(player_id)

func spawn_player(player_id):
	if players.has(player_id):
		print("Player ", player_id, " already spawned")
		return

	print("Spawning player ", player_id)

	# Create player instance
	var new_player = network_player_scene.instance()

	# Set up network player script (switch to network version)
	var network_script = load("res://scenes/entity/player_network.gd")
	new_player.set_script(network_script)

	# Configure player
	new_player.set_player_id(player_id)
	new_player.name = "Player" + str(player_id)
	new_player.add_to_group("player")

	# Set spawn position (different spawn points for each player)
	var spawn_positions = [
		Vector2(512, 512),   # Player 1
		Vector2(612, 512),   # Player 2
		Vector2(512, 612),   # Player 3
		Vector2(612, 612),   # Player 4
		Vector2(412, 512),   # Player 5
		Vector2(512, 412),   # Player 6
		Vector2(412, 412),   # Player 7
		Vector2(612, 412)    # Player 8
	]

	var spawn_index = (player_id - 1) % spawn_positions.size()
	new_player.position = spawn_positions[spawn_index]

	# Add to scene
	y_sort.add_child(new_player)

	# Track player
	players[player_id] = new_player

	# Set as local player if it's ours
	var local_id = get_tree().get_network_unique_id()
	if player_id == local_id:
		local_player = new_player
		player = new_player  # For camera tracking

		# Initialize camera to local player's position
		var p_pos:Vector2 = (new_player.position / vp_size)
		var initial_cam_pos := Vector2(int(p_pos.x), int(p_pos.y)) * vp_size
		camera.position = initial_cam_pos
		c_current_pos = initial_cam_pos

		# Mark starting room as visited
		var room_key = Vector2(int(initial_cam_pos.x / vp_size.x), int(initial_cam_pos.y / vp_size.y))
		visited_rooms.append(room_key)
		if GameStats:
			GameStats.add_room()

		print("Local player spawned at ", new_player.position)

func _on_player_connected(player_id, player_info):
	print("Player connected to game: ", player_id)
	# Spawn the new player
	spawn_player(player_id)

func _on_player_disconnected(player_id):
	print("Player disconnected from game: ", player_id)
	# Remove the player
	if players.has(player_id):
		var player_node = players[player_id]
		if is_instance_valid(player_node):
			player_node.queue_free()
		players.erase(player_id)
