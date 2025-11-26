extends Node2D

# Game state
var money = 200
var lives = 20
var current_wave = 0
var enemies_in_wave = 5

# Tower placement
var placing_tower = false
var tower_to_place = null
var tower_cost = 0
var tower_preview = null

# Scenes
var enemy_scene = preload("res://scenes/Enemy.tscn")
var basic_tower_scene = preload("res://scenes/Tower.tscn")

# Nodes
onready var path = $Path2D
onready var wave_timer = $WaveTimer
onready var ui = $UI

func _ready():
	ui.update_money(money)
	ui.update_lives(lives)
	ui.update_wave(current_wave)
	wave_timer.connect("timeout", self, "_on_wave_timer_timeout")
	ui.connect_tower_buttons(self)
	start_next_wave()

func _input(event):
	if placing_tower and event is InputEventMouseButton and event.pressed and event.button_index == BUTTON_LEFT:
		place_tower(get_global_mouse_position())
	elif event is InputEventMouseButton and event.pressed and event.button_index == BUTTON_RIGHT:
		cancel_placement()

func _process(_delta):
	if placing_tower and tower_preview:
		tower_preview.global_position = get_global_mouse_position()

func start_tower_placement(tower_scene, cost):
	if money >= cost:
		placing_tower = true
		tower_cost = cost
		tower_to_place = tower_scene

		# Create preview
		tower_preview = tower_scene.instance()
		tower_preview.modulate = Color(1, 1, 1, 0.5)
		add_child(tower_preview)

func place_tower(pos):
	if spend_money(tower_cost):
		var tower = tower_to_place.instance()
		tower.global_position = pos
		$Towers.add_child(tower)
		cancel_placement()

func cancel_placement():
	placing_tower = false
	if tower_preview:
		tower_preview.queue_free()
		tower_preview = null

func on_basic_tower_button_pressed():
	start_tower_placement(basic_tower_scene, 100)

func on_sniper_tower_button_pressed():
	# TODO: Create sniper tower scene
	pass

func start_next_wave():
	current_wave += 1
	enemies_in_wave = 5 + (current_wave * 2)
	ui.update_wave(current_wave)
	spawn_enemies()

func spawn_enemies():
	for i in range(enemies_in_wave):
		yield(get_tree().create_timer(1.0), "timeout")
		var enemy = enemy_scene.instance()
		enemy.connect("reached_end", self, "_on_enemy_reached_end")
		enemy.connect("died", self, "_on_enemy_died")
		path.add_child(enemy)

func _on_enemy_reached_end():
	lives -= 1
	ui.update_lives(lives)
	if lives <= 0:
		game_over()

func _on_enemy_died(reward):
	money += reward
	ui.update_money(money)

	# Check if wave is complete
	yield(get_tree().create_timer(0.1), "timeout")
	if path.get_child_count() == 1:  # Only PathFollow2D left
		wave_timer.start()

func _on_wave_timer_timeout():
	start_next_wave()

func game_over():
	print("Game Over!")
	get_tree().paused = true

func spend_money(amount):
	if money >= amount:
		money -= amount
		ui.update_money(money)
		return true
	return false
