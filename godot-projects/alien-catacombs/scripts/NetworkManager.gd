extends Node

# Network signals
signal player_connected(peer_id, player_info)
signal player_disconnected(peer_id)
signal server_disconnected

# Network configuration
const DEFAULT_PORT = 7777
const MAX_PLAYERS = 8

# Player data
var players = {}
var player_info = {"name": "Player"}

# Network peer
var network = NetworkedMultiplayerENet.new()

func _ready():
	# Connect network signals
	get_tree().connect("network_peer_connected", self, "_on_player_connected")
	get_tree().connect("network_peer_disconnected", self, "_on_player_disconnected")
	get_tree().connect("connected_to_server", self, "_on_connected_to_server")
	get_tree().connect("connection_failed", self, "_on_connection_failed")
	get_tree().connect("server_disconnected", self, "_on_server_disconnected")

# Host a game
func create_server(port = DEFAULT_PORT):
	network.create_server(port, MAX_PLAYERS)
	get_tree().set_network_peer(network)
	print("Server created on port ", port)

	# Add host as player
	players[1] = player_info
	emit_signal("player_connected", 1, player_info)

# Join a game
func join_server(ip, port = DEFAULT_PORT):
	network.create_client(ip, port)
	get_tree().set_network_peer(network)
	print("Attempting to connect to ", ip, ":", port)

# Disconnect
func disconnect_from_game():
	if get_tree().network_peer:
		get_tree().network_peer.close_connection()
		get_tree().set_network_peer(null)
	players.clear()

# Called on server when a player connects
func _on_player_connected(id):
	print("Player connected: ", id)

# Called on server when a player disconnects
func _on_player_disconnected(id):
	print("Player disconnected: ", id)
	players.erase(id)
	emit_signal("player_disconnected", id)

# Called on client when successfully connected to server
func _on_connected_to_server():
	print("Successfully connected to server")
	var local_player_id = get_tree().get_network_unique_id()
	rpc("register_player", local_player_id, player_info)

# Called on client when connection fails
func _on_connection_failed():
	print("Connection failed")
	get_tree().set_network_peer(null)

# Called on client when server disconnects
func _on_server_disconnected():
	print("Server disconnected")
	get_tree().set_network_peer(null)
	players.clear()
	emit_signal("server_disconnected")

# Register player info on server
remote func register_player(id, info):
	players[id] = info
	emit_signal("player_connected", id, info)

	# If we're the server, send back all existing players to the new player
	if get_tree().is_network_server():
		rpc_id(id, "register_players", players)

# Receive all players from server (called on client)
remote func register_players(player_list):
	players = player_list

# Utility functions
func is_host():
	return get_tree().is_network_server()

func get_player_count():
	return players.size()

func get_local_player_id():
	if get_tree().network_peer:
		return get_tree().get_network_unique_id()
	return 1  # Single player
