extends Area2D

# Crystal pickup - adds to crystal counter by type (blue, green, purple, red)

export(String, "blue", "green", "purple", "red") var crystal_type := "blue"
# TODO: Replace this with a proper pickup sound file
export(String, FILE, "*.ogg,*.wav,*.mp3") var pickup_sound_path := "res://asset/sounds/ad2f0a4c4b9225208e2ef46054a7fb0c36271f84356604640d3029fdb26f3d21-Punch1.ogg"

var crystal_manager = null
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

	# Wait for scene tree to be ready
	yield(get_tree(), "idle_frame")
	crystal_manager = get_node_or_null("/root/CrystalManager")

	# Connect to player detection
	connect("body_entered", self, "_on_body_entered")

func _on_body_entered(body):
	if body.is_in_group("player"):
		_pickup(body)

func _pickup(player):
	if not crystal_manager:
		print("CrystalManager not found!")
		queue_free()
		return

	# Add crystal to counter by type
	crystal_manager.add_crystal(crystal_type)

	# Play pickup sound
	if pickup_sound.stream:
		pickup_sound.play()

	# Hide sprite immediately
	$Sprite.visible = false
	$CollisionShape2D.set_deferred("disabled", true)

	# Wait for sound to finish before removing
	if pickup_sound.stream:
		yield(pickup_sound, "finished")

	# Remove crystal from scene
	queue_free()
