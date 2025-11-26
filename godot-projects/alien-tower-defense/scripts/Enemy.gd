extends PathFollow2D

signal reached_end
signal died(reward)

export var speed = 100.0
export var max_health = 100.0
export var reward = 25

var health

onready var health_bar = $HealthBar

func _ready():
	health = max_health
	health_bar.max_value = max_health
	health_bar.value = health

func _process(delta):
	offset += speed * delta

	if unit_offset >= 1.0:
		emit_signal("reached_end")
		queue_free()

func take_damage(amount):
	health -= amount
	health_bar.value = health

	if health <= 0:
		emit_signal("died", reward)
		queue_free()
