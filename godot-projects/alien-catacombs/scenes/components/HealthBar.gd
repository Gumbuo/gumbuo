extends Node2D

# Simple healthbar component that displays above entities
# Automatically updates based on parent's Health component

onready var bar = $ProgressBar
var health_component = null

export var hide_when_full := true
export var offset_y := -20.0  # How far above the entity to display

func _ready():
	# Find the Health component in parent
	var parent = get_parent()
	if parent.has_node("Health"):
		health_component = parent.get_node("Health")
		health_component.connect("health_changed", self, "_on_health_changed")
		_update_bar()

	# Position above entity
	position.y = offset_y

func _on_health_changed(_current, _max):
	_update_bar()

func _update_bar():
	if not health_component:
		return

	var percent = float(health_component.current_health) / float(health_component.max_health)
	bar.value = percent * 100

	# Hide when at full health
	if hide_when_full:
		visible = percent < 1.0
