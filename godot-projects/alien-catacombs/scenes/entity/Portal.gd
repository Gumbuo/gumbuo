extends Area2D

# Portal - teleports player to specified level

export(String, FILE, "*.tscn") var target_level := ""
export(int, 1, 5) var destination_level_number := 2  # Which level (1-5) this portal leads to
export(Color) var portal_color := Color(0, 0.5, 1)  # Default blue

onready var sprite = $Sprite
onready var light = $Light2D
onready var animation_player = $AnimationPlayer

var can_teleport := true

func _ready():
	# Apply portal color tint
	sprite.modulate = portal_color
	if light:
		light.color = portal_color

	# Connect to player detection
	connect("body_entered", self, "_on_body_entered")

	# Start animation if available
	if animation_player and animation_player.has_animation("pulse"):
		animation_player.play("pulse")

func _on_body_entered(body):
	if body.is_in_group("player") and can_teleport:
		_teleport_player(body)

func _teleport_player(player):
	if target_level == "" or not ResourceLoader.exists(target_level):
		print("Portal Error: Invalid target level - ", target_level)
		return

	# Prevent multiple teleports
	can_teleport = false

	# Track level progression in GameStats for leaderboard
	if GameStats:
		GameStats.set_level(destination_level_number)
		print("Player entering portal to level ", destination_level_number)

	# TODO: Add teleport visual/sound effect

	# Change scene to target level
	var _result = get_tree().change_scene(target_level)
