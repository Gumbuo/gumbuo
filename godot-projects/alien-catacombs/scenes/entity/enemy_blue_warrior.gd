extends Enemy

# Blue Warrior - Fast melee fighter
# Electric blue bioluminescent close combat specialist

func _ready():
	# Enable directional sprites
	use_directional_sprites = true
	sprite_base_path = "res://asset/characters/pixellab/blue_alien_warrior/rotations/"

	._ready()

	# Configure as MELEE enemy
	attack_type = AttackType.MELEE
	melee_damage = 15  # Strong melee damage
	melee_range = 22.0
	melee_cooldown = 1.0  # Fast attacks

	# Blue Warrior stats - fast and aggressive
	speed = 60  # Faster than most enemies
	detection_range = 170.0

# Override animation if needed
func animation():
	.animation()  # Use parent animation system
