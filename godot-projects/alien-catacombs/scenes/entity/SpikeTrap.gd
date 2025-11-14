extends Area2D

# Spike Trap - Damages player on contact

export var damage := 10
export var damage_cooldown := 1.0  # Seconds between damage ticks

var can_damage := true
onready var damage_timer := Timer.new()

func _ready():
	# Setup damage cooldown timer
	add_child(damage_timer)
	damage_timer.one_shot = true
	damage_timer.connect("timeout", self, "_on_damage_timer_timeout")

	# Connect to body detection
	connect("body_entered", self, "_on_body_entered")
	connect("body_exited", self, "_on_body_exited")

func _on_body_entered(body):
	if body.is_in_group("player") and can_damage:
		_damage_player(body)

func _on_body_exited(body):
	# Reset damage when player leaves (optional)
	pass

func _damage_player(player):
	# Try to find Health component
	var health_component = player.get_node_or_null("Health")
	if health_component and health_component.has_method("take_damage"):
		health_component.take_damage(damage)
		print("Spike trap dealt ", damage, " damage!")
	else:
		print("Player doesn't have a Health component!")

	# Start cooldown
	can_damage = false
	damage_timer.start(damage_cooldown)

func _on_damage_timer_timeout():
	can_damage = true
