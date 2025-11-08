extends Node

# Global game stats tracker with real-time JavaScript communication
# Tracks cumulative stats and sends updates to parent window for leaderboard

signal stats_updated(stats)

# Cumulative Stats
var total_coins := 0
var total_kills := 0
var total_rooms_explored := 0
var total_shots_fired := 0
var total_shots_hit := 0
var total_damage_dealt := 0
var session_start_time := 0
var total_playtime := 0.0  # Cumulative across all sessions

# Current Session Stats
var session_coins := 0
var session_kills := 0
var session_rooms := 0
var session_shots_fired := 0
var session_shots_hit := 0

func _ready():
	session_start_time = OS.get_ticks_msec()

	# Load cumulative stats from localStorage (via JavaScript if HTML5)
	load_stats()

	# Auto-save every 5 seconds
	var timer = Timer.new()
	timer.wait_time = 5.0
	timer.autostart = true
	timer.connect("timeout", self, "_auto_update")
	add_child(timer)

func _auto_update():
	send_stats_to_js()

# Track coin collection
func add_coin(coin_type: String = "blue"):
	session_coins += 1
	total_coins += 1
	send_stats_to_js()

# Track enemy kills
func add_kill():
	session_kills += 1
	total_kills += 1
	send_stats_to_js()

# Track room exploration
func add_room():
	session_rooms += 1
	total_rooms_explored += 1
	send_stats_to_js()

# Track shots fired
func add_shot_fired():
	session_shots_fired += 1
	total_shots_fired += 1

# Track shots that hit
func add_shot_hit():
	session_shots_hit += 1
	total_shots_hit += 1

# Track damage dealt
func add_damage(amount: int):
	total_damage_dealt += amount

# Calculate current playtime
func get_playtime() -> float:
	var current_session = (OS.get_ticks_msec() - session_start_time) / 1000.0
	return total_playtime + current_session

# Calculate accuracy
func get_accuracy() -> float:
	if total_shots_fired == 0:
		return 0.0
	return (float(total_shots_hit) / float(total_shots_fired)) * 100.0

# Calculate Alien Points based on formula
func calculate_alien_points() -> int:
	var points = 0
	points += total_kills * 10
	points += total_coins * 5
	points += total_rooms_explored * 20
	points += int(get_accuracy() * 2.0)
	points += int(get_playtime() * 0.5)
	return points

# Get stats dictionary
func get_stats() -> Dictionary:
	return {
		"totalCoins": total_coins,
		"totalKills": total_kills,
		"totalRooms": total_rooms_explored,
		"totalShots": total_shots_fired,
		"totalHits": total_shots_hit,
		"totalDamage": total_damage_dealt,
		"playtime": get_playtime(),
		"accuracy": get_accuracy(),
		"alienPoints": calculate_alien_points(),
		"sessionCoins": session_coins,
		"sessionKills": session_kills,
		"sessionRooms": session_rooms
	}

# Send stats to JavaScript (HTML5 export only)
func send_stats_to_js():
	if OS.get_name() == "HTML5":
		var stats = get_stats()
		var json_stats = JSON.print(stats)

		# Send postMessage to parent window
		var js_code = """
		if (window.parent) {
			window.parent.postMessage({
				type: 'ALIEN_CATACOMBS_STATS',
				stats: %s
			}, '*');
		}
		""" % json_stats

		JavaScript.eval(js_code)
		print("Stats sent to JS: ", stats)

# Load stats from localStorage (HTML5 only)
func load_stats():
	if OS.get_name() != "HTML5":
		return

	var js_code = """
	(function() {
		var stats = localStorage.getItem('alienCatacombsStats');
		if (stats) {
			return JSON.parse(stats);
		}
		return null;
	})()
	"""

	var result = JavaScript.eval(js_code)
	if result:
		# Parse loaded stats
		if "totalCoins" in result:
			total_coins = int(result.totalCoins)
		if "totalKills" in result:
			total_kills = int(result.totalKills)
		if "totalRooms" in result:
			total_rooms_explored = int(result.totalRooms)
		if "totalShots" in result:
			total_shots_fired = int(result.totalShots)
		if "totalHits" in result:
			total_shots_hit = int(result.totalHits)
		if "totalDamage" in result:
			total_damage_dealt = int(result.totalDamage)
		if "playtime" in result:
			total_playtime = float(result.playtime)

		print("Loaded cumulative stats from localStorage")

# Save stats to localStorage (HTML5 only)
func save_stats():
	if OS.get_name() != "HTML5":
		return

	var stats = get_stats()
	var json_stats = JSON.print(stats)

	var js_code = """
	localStorage.setItem('alienCatacombsStats', '%s');
	""" % json_stats

	JavaScript.eval(js_code)
	print("Saved stats to localStorage")

# Reset session stats (called when starting new game)
func reset_session():
	session_coins = 0
	session_kills = 0
	session_rooms = 0
	session_shots_fired = 0
	session_shots_hit = 0
	session_start_time = OS.get_ticks_msec()
	send_stats_to_js()

# Called when game closes
func _exit_tree():
	# Save final playtime
	total_playtime = get_playtime()
	save_stats()
	send_stats_to_js()
