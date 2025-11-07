extends CanvasLayer

# Player HUD that displays health and other stats
# Automatically finds the player and updates display

onready var health_bar = $MarginContainer/HBoxContainer/HealthBar
onready var health_label = $MarginContainer/HBoxContainer/HealthValue

var player = null

func _ready():
	# Find the player
	yield(get_tree(), "idle_frame")  # Wait one frame to ensure player is ready
	_find_player()

	if player and player.has_node("Health"):
		var health = player.get_node("Health")
		health.connect("health_changed", self, "_on_player_health_changed")
		_update_health_display(health.current_health, health.max_health)

func _find_player():
	var players = get_tree().get_nodes_in_group("player")
	if players.size() > 0:
		player = players[0]

func _on_player_health_changed(current, max_health):
	_update_health_display(current, max_health)

func _update_health_display(current, max_health):
	if not health_bar:
		return

	var percent = float(current) / float(max_health) * 100.0
	health_bar.value = percent
	health_label.text = str(current) + "/" + str(max_health)

	# Color based on health percentage
	if percent > 60:
		health_bar.modulate = Color(0.2, 1.0, 0.2)  # Green
	elif percent > 30:
		health_bar.modulate = Color(1.0, 0.8, 0.2)  # Yellow
	else:
		health_bar.modulate = Color(1.0, 0.2, 0.2)  # Red
