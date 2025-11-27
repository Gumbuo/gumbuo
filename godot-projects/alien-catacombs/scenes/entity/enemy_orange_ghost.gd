extends Enemy

# Orange Ghost Specter - Balanced ranged attacker

func _ready():
	._ready()

	# Enable directional sprite system
	use_directional_sprites = true
	sprite_base_path = "res://sprites/orange_ghost/rotations/"
	_load_directional_sprites()

	# Configure as RANGED enemy
	attack_type = AttackType.RANGED
	shoot_range = 130.0
	shoot_cooldown = 1.0

	# Orange Ghost stats - balanced
	speed = 42
	detection_range = 150.0

func _physics_process(delta):
	._physics_process(delta)
	animation()

func animation():
	if sprite and sprite is AnimatedSprite:
		if sprite.animation != "idle":
			sprite.play("idle")
