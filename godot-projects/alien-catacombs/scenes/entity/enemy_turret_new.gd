extends Enemy

# Turret - Stationary ranged attacker
# Biomechanical turret that guards areas

func _ready():
	# Enable directional sprites
	use_directional_sprites = true
	sprite_base_path = "res://asset/characters/pixellab/turret_enemy/rotations/"

	._ready()

	# Configure as RANGED enemy
	attack_type = AttackType.RANGED
	is_stationary = true  # Turrets don't move
	shoot_range = 160.0  # Long range
	shoot_cooldown = 1.5  # Slower but steady

	# Turret stats - stationary
	speed = 0  # Doesn't move
	detection_range = 180.0  # Wide detection

# Override animation if needed
func animation():
	.animation()  # Use parent animation system
