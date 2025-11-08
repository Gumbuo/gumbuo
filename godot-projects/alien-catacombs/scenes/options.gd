extends Control

# Options/Settings menu placeholder
# This script is attached to the options scene

func _ready():
	pass

func _on_button_back_pressed():
	# Return to previous scene
	get_tree().change_scene("res://scenes/main_menu.tscn")
