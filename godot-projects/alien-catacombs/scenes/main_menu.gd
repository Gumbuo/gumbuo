extends Control

var options_packed := preload("res://scenes_examples/options.tscn")
onready var button_start = $center_container/v_box_container/button_start
onready var button_settings = $center_container/v_box_container/button_settings
onready var button_quit = $center_container/v_box_container/button_quit

func _ready() -> void:
	button_start.grab_focus()

func _on_button_start_pressed():
	# Start the game by loading the main scene
	get_tree().change_scene("res://scenes/main.tscn")

func _on_button_settings_pressed():
	# Toggle options menu
	if !has_node("options"):
		var options = options_packed.instance()
		options.connect("close", self, "_on_options_closed")
		add_child(options)
		# Disable menu buttons while in options
		button_start.disabled = true
		button_quit.disabled = true
	else:
		_on_options_closed()

func _on_options_closed():
	# Remove options menu and re-enable buttons
	if has_node("options"):
		get_node("options").queue_free()
	button_settings.pressed = false
	button_start.disabled = false
	button_quit.disabled = false
	button_start.grab_focus()

func _on_button_quit_pressed():
	get_tree().quit()
