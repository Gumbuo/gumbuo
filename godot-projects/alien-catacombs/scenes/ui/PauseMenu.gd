extends CanvasLayer

# Pause Menu - toggles with ESC key

onready var panel = $Panel

var is_paused := false

func _ready():
	visible = false
	is_paused = false

func _input(event):
	if event.is_action_pressed("ui_cancel"):  # ESC key
		toggle_pause()

func toggle_pause():
	is_paused = !is_paused
	visible = is_paused
	get_tree().paused = is_paused

func _on_Resume_pressed():
	toggle_pause()

func _on_Quit_pressed():
	# Return to main menu
	get_tree().paused = false
	get_tree().change_scene("res://scenes/main_menu.tscn")
