extends CanvasLayer

onready var money_label = $TopBar/MoneyLabel
onready var lives_label = $TopBar/LivesLabel
onready var wave_label = $TopBar/WaveLabel
onready var basic_tower_btn = $TowerMenu/BasicTowerButton
onready var sniper_tower_btn = $TowerMenu/SniperTowerButton

func connect_tower_buttons(game_manager):
	basic_tower_btn.connect("pressed", game_manager, "on_basic_tower_button_pressed")
	sniper_tower_btn.connect("pressed", game_manager, "on_sniper_tower_button_pressed")

func update_money(amount):
	money_label.text = "Money: $" + str(amount)

func update_lives(amount):
	lives_label.text = "Lives: " + str(amount)

func update_wave(wave):
	wave_label.text = "Wave: " + str(wave)
