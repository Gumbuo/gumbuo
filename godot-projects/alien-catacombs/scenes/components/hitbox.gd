extends Area2D

class_name Hitbox

# Hitbox for attacks - detects when it hits a Hurtbox

export var damage := 10
export var knockback_force := 200

var active := false

signal hit_landed(target)

func _ready():
	connect("area_entered", self, "_on_area_entered")
	set_deferred("monitoring", false)

func activate():
	active = true
	set_deferred("monitoring", true)

func deactivate():
	active = false
	set_deferred("monitoring", false)

func _on_area_entered(area):
	if not active:
		return

	if area is Hurtbox:
		# Don't hit yourself!
		var attacker = get_parent()
		var target = area.get_parent()
		if attacker == target:
			return

		area.take_hit(damage, knockback_force, attacker.global_position)
		emit_signal("hit_landed", target)
