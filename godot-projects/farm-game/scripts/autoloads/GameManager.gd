extends Node

signal day_changed(day: int, season: String)
signal season_changed(season: String)
signal time_of_day_changed(hour: float)

const SEASONS := ["Spring", "Summer", "Autumn", "Winter"]
const DAYS_PER_SEASON := 7
const DAY_LENGTH_SECONDS := 300.0

var current_day: int = 1
var current_season_index: int = 0
var current_season: String = "Spring"
var time_of_day: float = 8.0
var is_daytime: bool = true

var _day_timer: float = 0.0

func _ready() -> void:
	set_process(true)

func _process(delta: float) -> void:
	_day_timer += delta
	var day_progress := _day_timer / DAY_LENGTH_SECONDS
	time_of_day = 6.0 + day_progress * 18.0
	time_of_day_changed.emit(time_of_day)

	var was_daytime := is_daytime
	is_daytime = time_of_day >= 6.0 and time_of_day < 20.0
	if was_daytime != is_daytime:
		pass

	if _day_timer >= DAY_LENGTH_SECONDS:
		_day_timer = 0.0
		_advance_day()

func _advance_day() -> void:
	current_day += 1
	if current_day > DAYS_PER_SEASON:
		current_day = 1
		current_season_index = (current_season_index + 1) % SEASONS.size()
		current_season = SEASONS[current_season_index]
		season_changed.emit(current_season)
	day_changed.emit(current_day, current_season)
	PlayerData.save_data()

func get_season() -> String:
	return current_season

func get_day_number() -> int:
	return current_day
