extends Control

onready var button_start = $center_container/v_box_container/button_start
onready var button_settings = $center_container/v_box_container/button_settings
onready var button_quit = $center_container/v_box_container/button_quit

func _ready() -> void:
	button_start.grab_focus()

func _on_button_start_pressed():
	# Start the game by loading the main scene
	get_tree().change_scene("res://scenes/main.tscn")

func _on_button_settings_pressed():
	# Settings menu not implemented yet
	print("Settings button pressed - not implemented yet")

func _on_button_quit_pressed():
	get_tree().quit()
