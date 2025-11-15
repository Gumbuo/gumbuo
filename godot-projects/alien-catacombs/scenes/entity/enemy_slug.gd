extends Enemy

# Slug - Slow melee attacker
# Slimy creature that slowly approaches and attacks

func _ready():
	# Enable directional sprites
	use_directional_sprites = true
	sprite_base_path = "res://asset/characters/pixellab/slug_alien/rotations/"

	._ready()

	# Configure as MELEE enemy
	attack_type = AttackType.MELEE
	melee_damage = 8
	melee_range = 18.0
	melee_cooldown = 1.5

	# Slug stats - slower and weaker
	speed = 30  # Very slow
	detection_range = 130.0

# Override animation if needed
func animation():
	.animation()  # Use parent animation system
