extends Node2D

export var speed = 400.0

var target = null
var damage = 25.0

func _process(delta):
	if not is_instance_valid(target):
		queue_free()
		return

	var direction = (target.global_position - global_position).normalized()
	global_position += direction * speed * delta

	var distance = global_position.distance_to(target.global_position)
	if distance < 10:
		target.take_damage(damage)
		queue_free()
