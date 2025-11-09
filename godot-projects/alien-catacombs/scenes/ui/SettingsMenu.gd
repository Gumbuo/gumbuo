extends Control

signal closed

onready var close_button = $VBoxContainer/CloseButton

func _ready():
	close_button.connect("pressed", self, "_on_close_pressed")

func _on_close_pressed():
	emit_signal("closed")
	queue_free()

func _input(event):
	if event.is_action_pressed("ui_cancel"):
		_on_close_pressed()
