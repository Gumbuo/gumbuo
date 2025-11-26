extends Node2D

export var damage = 25.0
export var fire_rate = 1.0

var projectile_scene = preload("res://scenes/Projectile.tscn")
var target = null

onready var range_area = $Range
onready var shoot_timer = $ShootTimer
onready var turret = $Turret

func _ready():
	shoot_timer.wait_time = fire_rate
	shoot_timer.connect("timeout", self, "_on_shoot_timer_timeout")
	range_area.connect("area_entered", self, "_on_area_entered")
	range_area.connect("area_exited", self, "_on_area_exited")

func _process(_delta):
	if target and is_instance_valid(target):
		var direction = (target.global_position - global_position).angle()
		turret.rect_rotation = rad2deg(direction)
	else:
		find_target()

func find_target():
	var enemies_in_range = range_area.get_overlapping_areas()
	if enemies_in_range.size() > 0:
		target = enemies_in_range[0].get_parent()

func _on_shoot_timer_timeout():
	if target and is_instance_valid(target):
		shoot(target)

func shoot(enemy):
	var projectile = projectile_scene.instance()
	projectile.global_position = global_position
	projectile.target = enemy
	projectile.damage = damage
	get_tree().root.get_node("Main/Projectiles").add_child(projectile)

func _on_area_entered(area):
	if not target:
		target = area.get_parent()

func _on_area_exited(area):
	if area.get_parent() == target:
		target = null
		find_target()
