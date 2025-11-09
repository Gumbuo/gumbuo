extends Control

onready var button_start = $center_container/v_box_container/button_start
onready var button_multiplayer = $center_container/v_box_container/button_multiplayer
onready var button_settings = $center_container/v_box_container/button_settings

var options_menu = null

func _ready() -> void:
	button_start.grab_focus()

func _on_button_start_pressed():
	# Start single player game
	get_tree().change_scene("res://scenes/main.tscn")

func _on_button_multiplayer_pressed():
	# Go to multiplayer lobby
	get_tree().change_scene("res://scenes/ui/MultiplayerLobby.tscn")

func _on_button_settings_pressed():
	# Settings disabled due to missing theme files
	print("Settings menu temporarily disabled")
	# TODO: Create new settings menu
	pass

func _on_options_closed():
	pass

