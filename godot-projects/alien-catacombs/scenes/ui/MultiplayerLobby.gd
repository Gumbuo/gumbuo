extends Control

onready var host_button = $VBoxContainer/HostButton
onready var join_button = $VBoxContainer/JoinButton
onready var ip_input = $VBoxContainer/IPInput
onready var start_button = $VBoxContainer/StartButton
onready var player_list = $VBoxContainer/PlayerList
onready var status_label = $VBoxContainer/StatusLabel

func _ready():
	# Connect buttons
	host_button.connect("pressed", self, "_on_host_pressed")
	join_button.connect("pressed", self, "_on_join_pressed")
	start_button.connect("pressed", self, "_on_start_pressed")

	# Connect network signals
	NetworkManager.connect("player_connected", self, "_on_player_connected")
	NetworkManager.connect("player_disconnected", self, "_on_player_disconnected")
	NetworkManager.connect("server_disconnected", self, "_on_server_disconnected")

	# Initially hide start button
	start_button.visible = false
	ip_input.text = "127.0.0.1"

func _on_host_pressed():
	NetworkManager.create_server()
	status_label.text = "Hosting game... Waiting for players"
	host_button.disabled = true
	join_button.disabled = true
	start_button.visible = true
	update_player_list()

func _on_join_pressed():
	var ip = ip_input.text
	if ip.empty():
		ip = "127.0.0.1"

	NetworkManager.join_server(ip)
	status_label.text = "Connecting to " + ip + "..."
	host_button.disabled = true
	join_button.disabled = true

func _on_start_pressed():
	# Only host can start
	if NetworkManager.is_host():
		rpc("start_game")

remotesync func start_game():
	# Load the multiplayer game scene
	get_tree().change_scene("res://scenes/main_multiplayer.tscn")

func _on_player_connected(id, info):
	print("Player joined lobby: ", id)
	update_player_list()
	status_label.text = "Players: " + str(NetworkManager.get_player_count())

func _on_player_disconnected(id):
	print("Player left lobby: ", id)
	update_player_list()
	status_label.text = "Players: " + str(NetworkManager.get_player_count())

func _on_server_disconnected():
	status_label.text = "Disconnected from server"
	get_tree().change_scene("res://scenes/main_menu.tscn")

func update_player_list():
	player_list.clear()
	for player_id in NetworkManager.players:
		var player_name = NetworkManager.players[player_id].get("name", "Player")
		player_list.add_item(player_name + " (ID: " + str(player_id) + ")")
