extends Node

signal wave_started(wave_number)
signal wave_completed(wave_number)
signal all_waves_completed

@export var enemy_scene: PackedScene
@export var spawn_points: Array[Marker3D] = []
@export var waves_config: Array[Dictionary] = []

var current_wave: int = 0
var enemies_alive: int = 0
var wave_in_progress: bool = false
var total_waves: int = 10

# Default wave configuration
var default_waves = [
	{"count": 3, "delay": 0.5},   # Wave 1
	{"count": 4, "delay": 0.4},   # Wave 2
	{"count": 5, "delay": 0.4},   # Wave 3
	{"count": 6, "delay": 0.3},   # Wave 4
	{"count": 7, "delay": 0.3},   # Wave 5
	{"count": 8, "delay": 0.25},  # Wave 6
	{"count": 9, "delay": 0.25},  # Wave 7
	{"count": 10, "delay": 0.2},  # Wave 8
	{"count": 12, "delay": 0.2},  # Wave 9
	{"count": 15, "delay": 0.15}  # Wave 10 - Final wave
]

func _ready():
	if enemy_scene == null:
		enemy_scene = preload("res://scenes/enemy.tscn")

	if waves_config.size() == 0:
		waves_config = default_waves

	total_waves = waves_config.size()

func start_waves():
	current_wave = 0
	start_next_wave()

func start_next_wave():
	if current_wave >= total_waves:
		all_waves_completed.emit()
		return

	wave_in_progress = true
	wave_started.emit(current_wave + 1)

	var config = waves_config[current_wave]
	var enemy_count = config.get("count", 3)
	var spawn_delay = config.get("delay", 0.5)

	# Spawn enemies with delay
	for i in range(enemy_count):
		spawn_enemy()
		await get_tree().create_timer(spawn_delay).timeout

func spawn_enemy():
	var enemy = enemy_scene.instantiate()

	# Random spawn position around the edges
	var spawn_pos = get_random_spawn_position()
	enemy.global_position = spawn_pos

	# Connect death signal
	enemy.died.connect(_on_enemy_died)
	enemies_alive += 1

	get_parent().add_child(enemy)

func get_random_spawn_position() -> Vector3:
	# If we have spawn points defined, use them
	if spawn_points.size() > 0:
		var spawn_point = spawn_points[randi() % spawn_points.size()]
		return spawn_point.global_position

	# Otherwise, spawn around the edges of the arena
	var edge = randi() % 4
	var x: float
	var z: float

	match edge:
		0: # North
			x = randf_range(-8, 8)
			z = -8
		1: # South
			x = randf_range(-8, 8)
			z = 8
		2: # East
			x = 8
			z = randf_range(-8, 8)
		3: # West
			x = -8
			z = randf_range(-8, 8)

	return Vector3(x, 0.5, z)

func _on_enemy_died():
	enemies_alive -= 1

	if enemies_alive <= 0 and wave_in_progress:
		wave_in_progress = false
		wave_completed.emit(current_wave + 1)
		current_wave += 1

		# Brief pause before next wave
		await get_tree().create_timer(2.0).timeout
		start_next_wave()

func get_wave_info() -> Dictionary:
	return {
		"current": current_wave + 1,
		"total": total_waves,
		"enemies_alive": enemies_alive,
		"in_progress": wave_in_progress
	}
