extends Enemy

# Crawler - Insectoid melee attacker
# Crawls to player and bites in close range

func _ready():
	# Enable directional sprites
	use_directional_sprites = true
	sprite_base_path = "res://asset/characters/pixellab/crawler_alien/rotations/"

	._ready()

	# Configure as MELEE enemy
	attack_type = AttackType.MELEE
	melee_damage = 12
	melee_range = 20.0
	melee_cooldown = 1.2

	# Crawler stats
	speed = 55  # Faster than average to close distance
	detection_range = 160.0

# Override animation if needed
func animation():
	.animation()  # Use parent animation system
