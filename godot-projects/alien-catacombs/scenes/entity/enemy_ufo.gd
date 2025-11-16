extends Enemy

# UFO - Flying saucer ranged attacker
# Small flying saucer with blue lights that shoots energy beams

func _ready():
	# Enable directional sprites
	# Using AnimatedSprite now, not directional sprites
	# use_directional_sprites = true
	# sprite_base_path = "..."

	._ready()

	# Configure as RANGED enemy
	attack_type = AttackType.RANGED
	shoot_range = 130.0
	shoot_cooldown = 1.0

	# UFO stats - agile flyer
	speed = 55
	detection_range = 160.0

# Override animation if needed
func animation():
	.animation()  # Use parent animation system
