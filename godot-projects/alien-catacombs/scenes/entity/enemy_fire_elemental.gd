extends Enemy

# Fire Elemental - Ranged attacker with directional sprites

func _ready():
	._ready()

	# Enable directional sprite system
	use_directional_sprites = true
	sprite_base_path = "res://sprites/fire_elemental/rotations/"
	_load_directional_sprites()

	# Configure as RANGED enemy
	attack_type = AttackType.RANGED
	shoot_range = 140.0
	shoot_cooldown = 1.2

	# Fire Elemental stats
	speed = 40
	detection_range = 160.0

	# Custom bullet color (orange/red fire)
	bullet_texture_path = ""  # Will use default bullet

func _physics_process(delta):
	._physics_process(delta)
	animation()

func animation():
	# Play idle animation
	if sprite and sprite is AnimatedSprite:
		if sprite.animation != "idle":
			sprite.play("idle")
