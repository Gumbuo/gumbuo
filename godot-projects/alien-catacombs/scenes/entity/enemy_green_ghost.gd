extends Enemy

# Green Ghost Specter - Slow heavy ranged attacker

func _ready():
	._ready()

	# Enable directional sprite system
	use_directional_sprites = true
	sprite_base_path = "res://sprites/green_ghost/rotations/"
	_load_directional_sprites()

	# Configure as HEAVY_RANGED enemy
	attack_type = AttackType.HEAVY_RANGED
	shoot_range = 160.0
	shoot_cooldown = 2.0

	# Green Ghost stats - slow but powerful
	speed = 30
	detection_range = 170.0

func _physics_process(delta):
	._physics_process(delta)
	animation()

func animation():
	if sprite and sprite is AnimatedSprite:
		if sprite.animation != "idle":
			sprite.play("idle")
