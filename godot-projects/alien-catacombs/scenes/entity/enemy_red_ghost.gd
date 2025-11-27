extends Enemy

# Red Ghost Specter - Contact damage (jellyfish-style)

func _ready():
	._ready()

	# Enable directional sprite system
	use_directional_sprites = true
	sprite_base_path = "res://sprites/red_ghost/rotations/"
	_load_directional_sprites()

	# Configure as CONTACT enemy
	attack_type = AttackType.CONTACT
	contact_damage = 8

	# Red Ghost stats - floaty and persistent
	speed = 45
	detection_range = 200.0

func _physics_process(delta):
	._physics_process(delta)
	animation()

func animation():
	if sprite and sprite is AnimatedSprite:
		if sprite.animation != "idle":
			sprite.play("idle")
