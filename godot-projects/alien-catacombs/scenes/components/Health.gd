extends Node

class_name Health

# Health component that can be added to any Entity (Player, Enemy)
# Handles health, damage, and death

signal health_changed(current_health, max_health)
signal damaged(amount)
signal healed(amount)
signal died

export var max_health := 100
export var invincible := false
export var invincibility_time := 0.5

var current_health: int setget set_health
var is_dead := false
var can_take_damage := true

onready var invincibility_timer := Timer.new()

func _ready():
	current_health = max_health

	# Setup invincibility timer
	add_child(invincibility_timer)
	invincibility_timer.one_shot = true
	invincibility_timer.connect("timeout", self, "_on_invincibility_timeout")

func set_health(value: int):
	var previous_health = current_health
	current_health = clamp(value, 0, max_health)
	emit_signal("health_changed", current_health, max_health)

	if current_health == 0 and not is_dead:
		die()

func take_damage(amount: int):
	if invincible or not can_take_damage or is_dead:
		return

	set_health(current_health - amount)
	emit_signal("damaged", amount)

	# Temporary invincibility after taking damage
	can_take_damage = false
	invincibility_timer.start(invincibility_time)

func heal(amount: int):
	if is_dead:
		return

	set_health(current_health + amount)
	emit_signal("healed", amount)

func die():
	is_dead = true
	emit_signal("died")

func _on_invincibility_timeout():
	can_take_damage = true

func get_health_percent() -> float:
	return float(current_health) / float(max_health) * 100.0
