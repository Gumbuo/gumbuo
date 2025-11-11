extends CanvasLayer

# Game Over Screen - shows when player dies

onready var color_rect = $color_rect
onready var v_box_container = $color_rect/v_box_container
onready var restart_button = $color_rect/v_box_container/Restart
onready var main_menu_button = $color_rect/v_box_container/MainMenu

func _ready():
	visible = false
	# Make sure this layer and all children process even when game is paused
	pause_mode = Node.PAUSE_MODE_PROCESS

	# CRITICAL: Set ColorRect to ignore mouse so it doesn't block button clicks
	if color_rect:
		color_rect.mouse_filter = Control.MOUSE_FILTER_IGNORE
		print("ColorRect mouse filter set to IGNORE")

	# Also set VBoxContainer pause mode
	if v_box_container:
		v_box_container.pause_mode = Node.PAUSE_MODE_PROCESS

	# Explicitly set pause mode on buttons
	if restart_button:
		restart_button.pause_mode = Node.PAUSE_MODE_PROCESS
		print("Restart button pause mode set")
	else:
		print("WARNING: Could not find Restart button node")

	if main_menu_button:
		main_menu_button.pause_mode = Node.PAUSE_MODE_PROCESS
		print("Main menu button pause mode set")
	else:
		print("WARNING: Could not find MainMenu button node")

	# Make all children also process when paused (backup)
	set_pause_mode_recursive(self)

func set_pause_mode_recursive(node):
	node.pause_mode = Node.PAUSE_MODE_PROCESS
	for child in node.get_children():
		set_pause_mode_recursive(child)

func _on_Restart_pressed():
	print("RESTART BUTTON CLICKED!")
	# Hide the game over screen first
	visible = false
	# Unpause the game
	get_tree().paused = false
	print("Game unpaused, reloading scene...")
	# Use call_deferred to safely reload the scene
	get_tree().call_deferred("reload_current_scene")

func _on_MainMenu_pressed():
	print("MAIN MENU BUTTON CLICKED!")
	# Hide the game over screen first
	visible = false
	# Unpause the game
	get_tree().paused = false
	print("Game unpaused, changing to main menu...")
	# Use call_deferred to safely change scenes
	get_tree().call_deferred("change_scene", "res://scenes/main_menu.tscn")
