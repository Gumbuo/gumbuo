extends Enemy

# Red Soldier - Armed ranged attacker
# Crimson armored warrior with gun

func _ready():
	# Enable directional sprites
	# Using AnimatedSprite now, not directional sprites
	# use_directional_sprites = true
	# sprite_base_path = "..."

	._ready()

	# Configure as RANGED enemy
	attack_type = AttackType.RANGED
	shoot_range = 150.0  # Longer range soldier
	shoot_cooldown = 0.9  # Faster fire rate

	# Red Soldier stats - trained shooter
	speed = 45
	detection_range = 180.0

# Override animation if needed
func animation():
	.animation()  # Use parent animation system
