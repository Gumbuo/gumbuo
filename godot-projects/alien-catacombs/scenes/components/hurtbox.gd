extends Area2D

class_name Hurtbox

# Hurtbox - receives damage from Hitboxes

signal hit_received(damage, knockback_force, attacker_position)

func take_hit(damage: int, knockback_force: float, attacker_position: Vector2):
	emit_signal("hit_received", damage, knockback_force, attacker_position)
