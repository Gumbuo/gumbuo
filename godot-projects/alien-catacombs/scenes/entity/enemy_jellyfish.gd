extends Enemy

# Jellyfish - Contact damage enemy
# Floating purple translucent creature that damages on touch

var contact_timer := 0.0
const CONTACT_DAMAGE_INTERVAL = 0.5  # Damage every 0.5 seconds while touching

func _ready():
	# Using AnimatedSprite now, not directional sprites
	# use_directional_sprites = true
	# sprite_base_path = "res://asset/characters/pixellab/jellyfish_alien/rotations/"

	._ready()

	# Configure as CONTACT enemy
	attack_type = AttackType.CONTACT
	contact_damage = 8  # Damage per tick
	detection_range = 150.0

	# Jellyfish stats - floater
	speed = 45  # Medium speed floater

	# Set up contact damage detection via Hitbox
	var hitbox = get_node_or_null("hitbox")
	if hitbox:
		hitbox.connect("body_entered", self, "_on_player_contacted")
		hitbox.connect("body_exited", self, "_on_player_left")

func _physics_process(delta):
	._physics_process(delta)

	# Apply contact damage while touching player
	if is_contacting_player and target:
		contact_timer += delta
		if contact_timer >= CONTACT_DAMAGE_INTERVAL:
			_apply_contact_damage()
			contact_timer = 0.0

func _on_player_contacted(body):
	if body.is_in_group("player"):
		is_contacting_player = true
		target = body
		contact_timer = 0.0
		_apply_contact_damage()  # Immediate damage on first contact

func _on_player_left(body):
	if body.is_in_group("player"):
		is_contacting_player = false

func _apply_contact_damage():
	if not target:
		return

	var player_hurtbox = target.get_node_or_null("Hurtbox")
	if player_hurtbox and player_hurtbox.has_method("take_damage"):
		player_hurtbox.take_damage(contact_damage, 50.0, global_position)
		print("Jellyfish contact damage: ", contact_damage)

# Override animation if needed
func animation():
	.animation()  # Use parent animation system
