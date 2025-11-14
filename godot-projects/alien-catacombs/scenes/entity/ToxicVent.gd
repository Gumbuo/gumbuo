extends Area2D

# Toxic Vent - Continuously damages player while they're standing on it

export var damage := 5
export var damage_interval := 0.5  # Damage every 0.5 seconds

var players_in_vent = []
onready var damage_timer := Timer.new()

func _ready():
	# Setup damage timer
	add_child(damage_timer)
	damage_timer.wait_time = damage_interval
	damage_timer.connect("timeout", self, "_on_damage_tick")

	# Connect to body detection
	connect("body_entered", self, "_on_body_entered")
	connect("body_exited", self, "_on_body_exited")

func _on_body_entered(body):
	if body.is_in_group("player"):
		players_in_vent.append(body)
		# Start damage timer if not already running
		if damage_timer.is_stopped():
			damage_timer.start()
			# Deal immediate damage on entry
			_damage_player(body)

func _on_body_exited(body):
	if body.is_in_group("player"):
		players_in_vent.erase(body)
		# Stop timer if no players in vent
		if players_in_vent.size() == 0:
			damage_timer.stop()

func _on_damage_tick():
	# Damage all players currently in the vent
	for player in players_in_vent:
		_damage_player(player)

func _damage_player(player):
	# Try to find Health component
	var health_component = player.get_node_or_null("Health")
	if health_component and health_component.has_method("take_damage"):
		health_component.take_damage(damage)
		print("Toxic vent dealt ", damage, " damage!")
	else:
		print("Player doesn't have a Health component!")
