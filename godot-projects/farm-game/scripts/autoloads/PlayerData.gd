extends Node

signal xp_changed(new_xp: int, level: int)
signal energy_changed(new_energy: int, max_energy: int)
signal level_up(new_level: int)

const IDENTITY_PATH := "user://identity.cfg"
const SAVE_PATH     := "user://player_data.cfg"
const BASE_MAX_ENERGY := 50
const XP_PER_LEVEL_BASE := 100
const XP_LEVEL_SCALE := 1.4

var player_name: String = "Farmer"
var wallet_address: String = ""

var player_id: String:
	get: return wallet_address.to_lower()

var level: int = 1
var xp: int = 0
var xp_to_next_level: int = 100
var energy: int = BASE_MAX_ENERGY
var max_energy: int = BASE_MAX_ENERGY

var silver: int = 0
var gold: float = 0.0
var last_claim_unix: int = 0
var last_food_time: float = 0.0
var farming_boost_until: float = 0.0
var apple_boost_until: float = 0.0   # +1 crop per harvest
var grow_faster_until: float = 0.0   # crops grow 15% faster (pear + lemon)
var peach_boost_until: float = 0.0   # harvest yields at least 6 crops

func _ready() -> void:
	var saved_name := _load_identity()  # also restores wallet_address from stored hash
	if saved_name != "" and wallet_address != "":
		player_name = saved_name
		load_data()
	# else: no identity yet — start screen will call set_username()

func has_identity() -> bool:
	return wallet_address != ""

func logout() -> void:
	wallet_address = ""
	player_name = "Farmer"
	LandManager.deed_inventory = {}
	# Clear auto-login but keep all account entries intact
	var cfg := ConfigFile.new()
	cfg.load(IDENTITY_PATH)
	var accounts: Dictionary = cfg.get_value("accounts", "data", {})
	cfg.set_value("accounts", "data", accounts)
	cfg.set_value("identity", "last_username", "")
	cfg.save(IDENTITY_PATH)

func set_username(name: String, password: String) -> void:
	player_name = name.strip_edges()
	wallet_address = _name_pass_to_id(player_name, password)
	_save_identity(player_name, wallet_address)
	load_data()
	LandManager.reload_player_deeds()

func check_password(name: String, password: String) -> bool:
	var expected_id := _name_pass_to_id(name.strip_edges(), password)
	var cfg := ConfigFile.new()
	if cfg.load(IDENTITY_PATH) != OK:
		return false
	var accounts: Dictionary = cfg.get_value("accounts", "data", {})
	return accounts.get(name.strip_edges().to_lower(), "") == expected_id

func _name_pass_to_id(name: String, password: String) -> String:
	var raw := (name.strip_edges().to_lower() + ":" + password).sha256_text()
	return "local_" + raw.substr(0, 16)

func _save_identity(name: String, pid: String) -> void:
	var cfg := ConfigFile.new()
	cfg.load(IDENTITY_PATH)  # load existing so we don't wipe other accounts
	var accounts: Dictionary = cfg.get_value("accounts", "data", {})
	accounts[name.to_lower()] = pid
	cfg.set_value("accounts", "data", accounts)
	cfg.set_value("identity", "last_username", name)
	cfg.save(IDENTITY_PATH)

func _load_identity() -> String:
	var cfg := ConfigFile.new()
	if cfg.load(IDENTITY_PATH) != OK:
		return ""
	var last: String = cfg.get_value("identity", "last_username", "")
	if last == "":
		return ""
	var accounts: Dictionary = cfg.get_value("accounts", "data", {})
	var stored_id: String = accounts.get(last.to_lower(), "")
	if stored_id != "":
		wallet_address = stored_id
	elif last.begins_with("0x"):
		# Wallet address stored directly as last_username
		wallet_address = last.to_lower()
	return last

func _is_edt() -> bool:
	var m: int = Time.get_datetime_dict_from_system(true)["month"]
	return m >= 4 and m <= 10

func get_eastern_time_string() -> String:
	var is_edt := _is_edt()
	var offset_sec := -14400 if is_edt else -18000
	var local := Time.get_datetime_dict_from_unix_time(
		int(Time.get_unix_time_from_system()) + offset_sec)
	var h: int = local["hour"]
	var ap := "AM" if h < 12 else "PM"
	if h == 0:
		h = 12
	elif h > 12:
		h -= 12
	return "%d:%02d %s %s" % [h, local["minute"], ap, "EDT" if is_edt else "EST"]

func can_claim_daily() -> bool:
	if last_claim_unix == 0:
		return true
	var offset_sec := -14400 if _is_edt() else -18000
	var now_unix := int(Time.get_unix_time_from_system())
	var last_d := Time.get_datetime_dict_from_unix_time(last_claim_unix + offset_sec)
	var now_d := Time.get_datetime_dict_from_unix_time(now_unix + offset_sec)
	return now_d["day"] != last_d["day"] or now_d["month"] != last_d["month"]

func claim_daily() -> int:
	var amount := 50 + level * 10
	add_silver(amount)
	last_claim_unix = int(Time.get_unix_time_from_system())
	save_data()
	return amount

func add_xp(amount: int) -> void:
	xp += amount
	while xp >= xp_to_next_level:
		xp -= xp_to_next_level
		_level_up()
	xp_changed.emit(xp, level)

func spend_energy(amount: int = 1) -> bool:
	if energy < amount:
		return false
	energy -= amount
	energy_changed.emit(energy, max_energy)
	return true

func restore_energy(amount: int) -> void:
	energy = min(energy + amount, max_energy)
	energy_changed.emit(energy, max_energy)

func add_silver(amount: int) -> void:
	silver += amount

func spend_silver(amount: int) -> bool:
	if silver < amount:
		return false
	silver -= amount
	return true

func add_gold(amount: float) -> void:
	gold = snappedf(gold + amount, 0.01)

func spend_gold(amount: float) -> bool:
	if gold + 0.00001 < amount:
		return false
	gold = snappedf(gold - amount, 0.01)
	return true

func can_eat_food() -> bool:
	return Time.get_unix_time_from_system() - last_food_time >= 30.0

func eat_food(item_id: String) -> bool:
	if not can_eat_food(): return false
	var info: Dictionary = ResourceManager.get_item_info(item_id)
	var restore: int = info.get("energy_restore", 0)
	if restore > 0:
		restore_energy(restore)
	var now: float = Time.get_unix_time_from_system()
	if info.get("farming_boost", false):
		farming_boost_until = now + 1800.0
	match info.get("fruit_boost", ""):
		"apple":        apple_boost_until = now + 900.0
		"pear", "lemon": grow_faster_until = now + 900.0
		"peach":        peach_boost_until  = now + 900.0
	last_food_time = now
	save_data()
	return true

func food_cooldown_remaining() -> int:
	return max(0, int(30.0 - (Time.get_unix_time_from_system() - last_food_time)))

func has_farming_boost() -> bool:
	return Time.get_unix_time_from_system() < farming_boost_until

func has_apple_boost() -> bool:
	return Time.get_unix_time_from_system() < apple_boost_until

func has_grow_faster() -> bool:
	return Time.get_unix_time_from_system() < grow_faster_until

func has_peach_boost() -> bool:
	return Time.get_unix_time_from_system() < peach_boost_until

func farming_boost_remaining() -> int:
	return max(0, int(farming_boost_until - Time.get_unix_time_from_system()))

func _level_up() -> void:
	level += 1
	max_energy = BASE_MAX_ENERGY + (level - 1) * 5
	energy = min(energy, max_energy)
	xp_to_next_level = int(XP_PER_LEVEL_BASE * pow(XP_LEVEL_SCALE, level - 1))
	level_up.emit(level)

func save_data() -> void:
	var cfg := ConfigFile.new()
	cfg.set_value("player", "wallet", wallet_address)
	cfg.set_value("player", "name", player_name)
	cfg.set_value("progress", "level", level)
	cfg.set_value("progress", "xp", xp)
	cfg.set_value("progress", "energy", energy)
	cfg.set_value("progress", "max_energy", max_energy)
	cfg.set_value("economy", "silver", silver)
	cfg.set_value("economy", "gold", float(gold))
	cfg.set_value("economy", "last_claim_unix", last_claim_unix)
	cfg.set_value("economy", "last_food_time", last_food_time)
	cfg.set_value("economy", "farming_boost_until", farming_boost_until)
	cfg.set_value("economy", "apple_boost_until", apple_boost_until)
	cfg.set_value("economy", "grow_faster_until", grow_faster_until)
	cfg.set_value("economy", "peach_boost_until", peach_boost_until)
	cfg.save(SAVE_PATH)

func set_wallet(address: String) -> void:
	wallet_address = address.to_lower()
	# Use shortened address as display name (0x1234…abcd)
	if player_name == "Farmer" or player_name == "":
		var a := wallet_address
		player_name = a.substr(0, 6) + "..." + a.substr(a.length() - 4)
	_save_identity(wallet_address, wallet_address)
	load_data()
	LandManager.reload_player_deeds()

func load_data() -> void:
	var cfg := ConfigFile.new()
	if cfg.load(SAVE_PATH) != OK:
		_init_new_player()
		return
	var saved_wallet: String = cfg.get_value("player", "wallet", "")
	if saved_wallet != wallet_address:
		# Save file belongs to a different identity (or was created without a wallet) — start fresh
		_init_new_player()
		return
	player_name = cfg.get_value("player", "name", player_name)
	level = cfg.get_value("progress", "level", 1)
	xp = cfg.get_value("progress", "xp", 0)
	energy = cfg.get_value("progress", "energy", BASE_MAX_ENERGY)
	max_energy = cfg.get_value("progress", "max_energy", BASE_MAX_ENERGY)
	xp_to_next_level = int(XP_PER_LEVEL_BASE * pow(XP_LEVEL_SCALE, level - 1))
	silver = cfg.get_value("economy", "silver", 0)
	gold = float(cfg.get_value("economy", "gold", 0.0))
	last_claim_unix = cfg.get_value("economy", "last_claim_unix", 0)
	last_food_time = cfg.get_value("economy", "last_food_time", 0.0)
	farming_boost_until = cfg.get_value("economy", "farming_boost_until", 0.0)
	apple_boost_until = cfg.get_value("economy", "apple_boost_until", 0.0)
	grow_faster_until = cfg.get_value("economy", "grow_faster_until", 0.0)
	peach_boost_until = cfg.get_value("economy", "peach_boost_until", 0.0)
	if silver < 5000:
		silver = 5000

func _init_new_player() -> void:
	energy = BASE_MAX_ENERGY
	max_energy = BASE_MAX_ENERGY
	xp_to_next_level = XP_PER_LEVEL_BASE
	silver = 5000
	gold = 0
	last_claim_unix = 0
	save_data()
	LandManager.grant_starter_pack()
