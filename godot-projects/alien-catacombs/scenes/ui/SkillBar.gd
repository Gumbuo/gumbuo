extends Control

# Skill/Level bar using sprite-based progress display
# Uses the blue bar from "Skill level sistem.png"

onready var progress_sprite = $TextureProgress

export var max_value := 100.0
export var current_value := 100.0 setget set_value

func _ready():
	update_bar()

func set_value(value: float):
	current_value = clamp(value, 0, max_value)
	update_bar()

func set_max(value: float):
	max_value = value
	update_bar()

func update_bar():
	if not progress_sprite:
		return

	var percent = (current_value / max_value) * 100.0
	progress_sprite.value = percent
