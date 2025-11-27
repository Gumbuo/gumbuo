extends Area2D

# Portal - teleports player to specified level

export(String, FILE, "*.tscn") var target_level := ""
export(int, 1, 5) var destination_level_number := 2  # Which level (1-5) this portal leads to
export(Color) var portal_color := Color(0, 0.5, 1)  # Default blue
export(bool) var requires_boss_kill := false  # If true, portal is hidden until boss dies

onready var sprite = $Sprite
onready var light = $Light2D
onready var animation_player = $AnimationPlayer

var can_teleport := true
var is_unlocked := false  # Track if boss-gated portal is unlocked

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

	# Hide portal if it requires boss kill
	if requires_boss_kill:
		_hide_portal()
		print("Portal hidden - waiting for boss defeat")

func _on_body_entered(body):
	# Don't teleport if portal requires boss kill and hasn't been unlocked
	if requires_boss_kill and not is_unlocked:
		return

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

# Called by level script when boss is defeated
func unlock():
	if not requires_boss_kill:
		return  # Portal doesn't need unlocking

	is_unlocked = true
	_show_portal()
	print("Portal unlocked! Player can now proceed to next level")

# Hide portal visually and disable collision
func _hide_portal():
	visible = false
	monitoring = false  # Disable Area2D detection
	monitorable = false

# Show portal with animation
func _show_portal():
	visible = true
	monitoring = true  # Enable Area2D detection
	monitorable = true

	# Play appear animation with scaling effect
	sprite.scale = Vector2(0.1, 0.1)
	var tween = create_tween()
	tween.set_trans(Tween.TRANS_ELASTIC)
	tween.set_ease(Tween.EASE_OUT)
	tween.tween_property(sprite, "scale", Vector2(1.0, 1.0), 0.8)
