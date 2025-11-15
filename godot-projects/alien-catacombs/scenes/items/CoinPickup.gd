extends Area2D

# Crystal pickup - adds to crystal counter by type (blue, green, purple)

export(String, "blue", "green", "purple") var coin_type := "blue"
export(AudioStream) var pickup_sound  # Assign in editor

var coin_manager = null
onready var audio_player = $AudioStreamPlayer2D if has_node("AudioStreamPlayer2D") else null

func _ready():
	# Wait for scene tree to be ready
	yield(get_tree(), "idle_frame")
	coin_manager = get_node_or_null("/root/CoinManager")

	# Connect to player detection
	connect("body_entered", self, "_on_body_entered")

func _on_body_entered(body):
	if body.is_in_group("player"):
		_pickup(body)

func _pickup(player):
	if not coin_manager:
		print("CoinManager not found!")
		queue_free()
		return

	# Add crystal to counter by type
	coin_manager.add_coin(coin_type)

	# Play pickup sound if available
	if pickup_sound and audio_player:
		audio_player.stream = pickup_sound
		audio_player.play()
		# Hide sprite but wait for sound to finish
		$Sprite.visible = false
		$CollisionShape2D.set_deferred("disabled", true)
		yield(audio_player, "finished")

	# Remove crystal from scene
	queue_free()
