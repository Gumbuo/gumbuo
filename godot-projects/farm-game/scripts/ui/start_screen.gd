extends Node

var _connect_btn: Button = null
var _status_lbl: Label = null
var _poll_timer: Timer = null

func _ready() -> void:
	if PlayerData.has_identity():
		get_tree().change_scene_to_file("res://scenes/world_map/WorldMap.tscn")
		return
	_build_ui()

func _build_ui() -> void:
	var bg := ColorRect.new()
	bg.set_anchors_preset(Control.PRESET_FULL_RECT)
	bg.color = Color(0.08, 0.13, 0.07)
	bg.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(bg)

	var center := Control.new()
	center.set_anchors_preset(Control.PRESET_FULL_RECT)
	center.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(center)

	var panel := PanelContainer.new()
	panel.custom_minimum_size = Vector2(320, 0)
	panel.anchor_left   = 0.5
	panel.anchor_top    = 0.5
	panel.anchor_right  = 0.5
	panel.anchor_bottom = 0.5
	panel.grow_horizontal = Control.GROW_DIRECTION_BOTH
	panel.grow_vertical   = Control.GROW_DIRECTION_BOTH
	center.add_child(panel)

	var pad := MarginContainer.new()
	for side in ["left","right","top","bottom"]:
		pad.add_theme_constant_override("margin_" + side, 28)
	panel.add_child(pad)

	var inner := VBoxContainer.new()
	inner.add_theme_constant_override("separation", 16)
	pad.add_child(inner)

	# Title
	var title := Label.new()
	title.text = "FOXSTEAD"
	title.add_theme_font_size_override("font_size", 28)
	title.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	title.modulate = Color(0.55, 0.85, 0.35)
	inner.add_child(title)

	var sub := Label.new()
	sub.text = "Entirely inspired by the game Nomstead and the Nomstead team!"
	sub.add_theme_font_size_override("font_size", 10)
	sub.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	sub.autowrap_mode = TextServer.AUTOWRAP_WORD
	sub.custom_minimum_size = Vector2(260, 0)
	sub.modulate = Color(0.65, 0.65, 0.65)
	inner.add_child(sub)

	inner.add_child(HSeparator.new())

	var prompt := Label.new()
	prompt.text = "Connect your Web3 wallet to play"
	prompt.add_theme_font_size_override("font_size", 13)
	prompt.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	prompt.modulate = Color(0.85, 0.90, 0.80)
	inner.add_child(prompt)

	# Connect button
	_connect_btn = Button.new()
	_connect_btn.text = "Connect Wallet"
	_connect_btn.custom_minimum_size = Vector2(260, 48)
	_connect_btn.add_theme_font_size_override("font_size", 15)
	_connect_btn.pressed.connect(_request_wallet)
	_style_connect_btn()
	inner.add_child(_connect_btn)

	# Status label
	_status_lbl = Label.new()
	_status_lbl.add_theme_font_size_override("font_size", 10)
	_status_lbl.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	_status_lbl.autowrap_mode = TextServer.AUTOWRAP_WORD
	_status_lbl.custom_minimum_size = Vector2(260, 0)
	_status_lbl.text = ""
	inner.add_child(_status_lbl)

	var hint := Label.new()
	hint.text = "MetaMask, Rainbow, Coinbase Wallet, and any EIP-1193 wallet supported."
	hint.add_theme_font_size_override("font_size", 9)
	hint.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	hint.autowrap_mode = TextServer.AUTOWRAP_WORD
	hint.custom_minimum_size = Vector2(260, 0)
	hint.modulate = Color(0.45, 0.50, 0.42)
	inner.add_child(hint)

	await get_tree().process_frame
	panel.position = Vector2(
		(get_viewport().get_visible_rect().size.x - panel.size.x) / 2.0,
		(get_viewport().get_visible_rect().size.y - panel.size.y) / 2.0
	)

func _request_wallet() -> void:
	if OS.get_name() != "Web":
		# Editor/dev fallback â€” use a fixed dev wallet address
		_on_wallet_connected("0xdeadbeefdeadbeefdeadbeefdeadbeef00000001")
		return

	JavaScriptBridge.eval("""
		window._godotWallet = undefined;
		(async function() {
			if (typeof window.ethereum === 'undefined') {
				window._godotWallet = '__no_provider__';
				return;
			}
			try {
				let provider = window.ethereum;
				const providers = window.ethereum.providers;
				if (Array.isArray(providers) && providers.length > 0) {
					provider = providers.find(p => p.isMetaMask && !p.isTrust)
					        || providers.find(p => p.isMetaMask)
					        || providers[0];
				}
				const accounts = await provider.request({ method: 'eth_requestAccounts' });
				window._godotWallet = accounts[0].toLowerCase();
			} catch(e) {
				window._godotWallet = e.code === 4001 ? '__rejected__' : '__error__';
			}
		})();
	""")

	_connect_btn.disabled = true
	_set_status("Waiting for wallet approval...", Color(0.75, 0.85, 0.65))

	_poll_timer = Timer.new()
	_poll_timer.wait_time = 0.25
	_poll_timer.autostart = true
	_poll_timer.timeout.connect(_poll_wallet)
	add_child(_poll_timer)

func _poll_wallet() -> void:
	var result: String = str(JavaScriptBridge.eval("window._godotWallet || ''"))
	if result == "" or result == "null":
		return  # still pending
	_poll_timer.stop()
	_poll_timer.queue_free()
	_poll_timer = null
	match result:
		"__no_provider__":
			_connect_btn.disabled = false
			_set_status("No Web3 wallet detected. Install MetaMask or Rainbow to play.", Color(1.0, 0.5, 0.4))
		"__rejected__":
			_connect_btn.disabled = false
			_set_status("Connection declined. Try again.", Color(1.0, 0.6, 0.3))
		"__error__":
			_connect_btn.disabled = false
			_set_status("Something went wrong. Try again.", Color(1.0, 0.5, 0.4))
		_:
			_on_wallet_connected(result)

func _on_wallet_connected(address: String) -> void:
	PlayerData.set_wallet(address)
	get_tree().change_scene_to_file("res://scenes/world_map/WorldMap.tscn")

func _set_status(msg: String, color: Color) -> void:
	_status_lbl.text = msg
	_status_lbl.modulate = color

func _style_connect_btn() -> void:
	for sd in [
		["normal",   Color(0.07, 0.22, 0.45), Color(0.25, 0.55, 1.0)],
		["hover",    Color(0.10, 0.28, 0.58), Color(0.40, 0.70, 1.0)],
		["pressed",  Color(0.05, 0.16, 0.35), Color(0.20, 0.45, 0.90)],
		["disabled", Color(0.12, 0.14, 0.18), Color(0.25, 0.28, 0.30)],
	]:
		var s := StyleBoxFlat.new()
		s.set_corner_radius_all(24)
		s.set_border_width_all(2)
		s.bg_color     = sd[1]
		s.border_color = sd[2]
		_connect_btn.add_theme_stylebox_override(sd[0], s)
	_connect_btn.add_theme_color_override("font_color", Color(0.75, 0.90, 1.0))
