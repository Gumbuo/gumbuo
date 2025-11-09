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
	# Load and show settings menu
	if options_menu == null:
		var options_scene = load("res://scenes_examples/options.tscn")
		options_menu = options_scene.instance()
		options_menu.connect("close", self, "_on_options_closed")
		add_child(options_menu)
	else:
		# If already exists, just show it
		options_menu.visible = true

func _on_options_closed():
	if options_menu:
		options_menu.queue_free()
		options_menu = null
	button_settings.grab_focus()

