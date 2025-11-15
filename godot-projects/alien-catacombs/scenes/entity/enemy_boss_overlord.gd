extends Enemy

# Boss Overlord - Heavy ranged attacker
# Large 4-armed boss with powerful slow shots

func _ready():
	# Enable directional sprites
	use_directional_sprites = true
	sprite_base_path = "res://asset/characters/pixellab/boss_alien_overlord/rotations/"

	._ready()

	# Configure as HEAVY_RANGED enemy
	attack_type = AttackType.HEAVY_RANGED
	shoot_range = 180.0  # Long range
	shoot_cooldown = 2.5  # Slow but powerful shots

	# Boss stats - tough and strong
	speed = 35  # Slow movement
	detection_range = 200.0  # Wide detection

# Override animation if needed
func animation():
	.animation()  # Use parent animation system
