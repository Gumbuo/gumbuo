extends Enemy

# Drone - Flying ranged attacker
# Mechanical drone with red scanner that shoots from distance

func _ready():
	# Enable directional sprites
	use_directional_sprites = true
	sprite_base_path = "res://asset/characters/pixellab/drone_enemy/rotations/"

	._ready()

	# Configure as RANGED enemy
	attack_type = AttackType.RANGED
	shoot_range = 140.0
	shoot_cooldown = 1.2

	# Drone stats - fast flyer
	speed = 50
	detection_range = 170.0

# Override animation if needed
func animation():
	.animation()  # Use parent animation system
