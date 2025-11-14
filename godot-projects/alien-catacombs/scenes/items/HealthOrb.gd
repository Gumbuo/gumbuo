extends Area2D

# Health Orb - heals player on pickup

export var heal_amount := 25
# TODO: Replace this with a proper pickup sound file
export(String, FILE, "*.ogg,*.wav,*.mp3") var pickup_sound_path := "res://asset/sounds/ad2f0a4c4b9225208e2ef46054a7fb0c36271f84356604640d3029fdb26f3d21-Punch1.ogg"

onready var pickup_sound := AudioStreamPlayer.new()

func _ready():
	# Setup pickup sound
	add_child(pickup_sound)
	if pickup_sound_path != "":
		var stream = load(pickup_sound_path)
		if stream:
			stream.loop = false  # Disable looping
			pickup_sound.stream = stream
			pickup_sound.volume_db = -10

	# Connect to player detection
	connect("body_entered", self, "_on_body_entered")

func _on_body_entered(body):
	if body.is_in_group("player"):
		_pickup(body)

func _pickup(player):
	# Try to find Health component
	var health_component = player.get_node_or_null("Health")
	if health_component and health_component.has_method("heal"):
		health_component.heal(heal_amount)
		print("Health orb healed player for ", heal_amount, " HP!")
	else:
		print("Player doesn't have a Health component!")

	# Play pickup sound
	if pickup_sound.stream:
		pickup_sound.play()

	# Hide sprite immediately
	$Sprite.visible = false
	$CollisionShape2D.set_deferred("disabled", true)

	# Wait for sound to finish before removing
	if pickup_sound.stream:
		yield(pickup_sound, "finished")

	# Remove orb from scene
	queue_free()
