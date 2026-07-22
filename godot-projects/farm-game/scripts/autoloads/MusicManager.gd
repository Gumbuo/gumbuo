extends Node

const MUSIC_TRACKS := [
	{"name": "Chill Vibes",     "file": "res://assets/audio/music/playstarz_music-chill-music-background-480175.mp3"},
]

var track_index: int = 0  # Chill Vibes plays on first launch

signal track_changed(index: int, track_name: String)

var _player: AudioStreamPlayer = null

func _ready() -> void:
	_player = AudioStreamPlayer.new()
	_player.bus = "Master"
	add_child(_player)
	_player.finished.connect(_on_finished)
	_play(track_index)

func _play(idx: int) -> void:
	track_index = clampi(idx, 0, MUSIC_TRACKS.size() - 1)
	var path: String = MUSIC_TRACKS[track_index]["file"]
	if ResourceLoader.exists(path):
		_player.stream = load(path) as AudioStream
		_player.play()
	track_changed.emit(track_index, MUSIC_TRACKS[track_index]["name"])

func play_pause() -> bool:
	if _player.playing:
		_player.stop()
	else:
		_player.play()
	return _player.playing

func next_track() -> void:
	_play((track_index + 1) % MUSIC_TRACKS.size())

func prev_track() -> void:
	_play((track_index - 1 + MUSIC_TRACKS.size()) % MUSIC_TRACKS.size())

func select_track(idx: int) -> void:
	_play(idx)

func is_playing() -> bool:
	return _player != null and _player.playing

func get_track_name() -> String:
	return MUSIC_TRACKS[track_index]["name"]

func _on_finished() -> void:
	next_track()
