extends Enemy

# Yellow Ghost Specter - Fast melee attacker

func _ready():
	._ready()

	# Enable directional sprite system
	use_directional_sprites = true
	sprite_base_path = "res://sprites/yellow_ghost/rotations/"
	_load_directional_sprites()

	# Configure as MELEE enemy
	attack_type = AttackType.MELEE
	melee_range = 20.0
	melee_damage = 12
	melee_cooldown = 1.0

	# Yellow Ghost stats - fast and aggressive
	speed = 45
	detection_range = 180.0

func _physics_process(delta):
	._physics_process(delta)
	animation()

func animation():
	if sprite and sprite is AnimatedSprite:
		if sprite.animation != "idle":
			sprite.play("idle")
