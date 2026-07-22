extends CanvasLayer

signal closed
signal item_crafted(item_id: String, count: int)

const STATION_TITLE := "BONFIRE  —  COOKING"
const BORDER_COLOR  := Color(0.65, 0.25, 0.05)
const TITLE_COLOR   := Color(1.00, 0.65, 0.25)
const ACTION_LABEL  := "COOK"

const RECIPES: Dictionary = {
	"carrot_cake":            {"desc": "Eat a carrot cake to gain 60 energy.",               "ing": {"carrot": 10, "egg": 1, "wheat_flour": 1},                     "energy": 1},
	"chicken_feed":           {"desc": "Feed your chickens to keep them productive.",        "ing": {"wheat_flour": 1, "fern": 10, "carrot": 10},                   "energy": 3},
	"french_fries":           {"desc": "Eat French fries to gain 25 energy.",               "ing": {"potato": 5},                                                  "energy": 1},
	"fruit_salad":            {"desc": "Restores 15 energy. Grants 30-min farming boost.",  "ing": {"apple": 1, "lemon": 1, "pear": 1, "peach": 1, "honey": 1},    "energy": 1},
	"golden_potato_cake":     {"desc": "Eat a golden potato cake to gain 80 energy.",       "ing": {"potato": 10, "egg": 1, "wheat_flour": 1},                     "energy": 1},
	"grape_tart_cake":        {"desc": "Eat a grape tart to gain 160 energy.",              "ing": {"grapes": 15, "egg": 1, "wheat_flour": 1},                     "energy": 1},
	"mushroom_omelette":      {"desc": "Eat a mushroom omelette to gain 45 energy.",        "ing": {"mushroom": 3, "egg": 1},                                      "energy": 1},
	"mushroom_soup":          {"desc": "Drink mushroom soup to gain 30 energy.",            "ing": {"mushroom": 1, "potato": 3},                                   "energy": 1},
	"pumpkin_bread":          {"desc": "Eat pumpkin bread to gain 55 energy.",              "ing": {"pumpkin": 3, "bread": 1},                                     "energy": 1},
	"pumpkin_spice_cake":     {"desc": "Eat a pumpkin spice cake to gain 120 energy.",      "ing": {"pumpkin": 10, "egg": 1, "wheat_flour": 1},                    "energy": 1},
	"tomato_omelette":        {"desc": "Eat a tomato omelette to gain 30 energy.",          "ing": {"tomato": 3, "egg": 1},                                        "energy": 1},
	"upside_down_tomato_cake":{"desc": "Eat upside down tomato cake to gain 100 energy.",  "ing": {"tomato": 10, "egg": 1, "wheat_flour": 1},                     "energy": 1},
	"veggie_salad":           {"desc": "Eat a veggie salad to gain 15 energy.",             "ing": {"cucumber": 1, "fern": 1, "tomato": 1},                        "energy": 1},
	"wrapped_potato":         {"desc": "Eat a wrapped potato to gain 20 energy.",           "ing": {"fern": 2, "potato": 2},                                       "energy": 1},
}

const RES_NAME: Dictionary = {
	"carrot":      "Carrot",      "egg":        "Egg",        "wheat_flour": "Wheat Flour",
	"fern":        "Fern",        "potato":     "Potato",     "apple":       "Apple",
	"lemon":       "Lemon",       "pear":       "Pear",       "peach":       "Peach",
	"honey":       "Honey",       "grapes":     "Grapes",     "mushroom":    "Mushroom",
	"bread":       "Bread",       "pumpkin":    "Pumpkin",    "tomato":      "Tomato",
	"cucumber":    "Cucumber",
}

const RES_COLOR: Dictionary = {
	"carrot":      Color(0.90, 0.50, 0.10),
	"egg":         Color(0.95, 0.92, 0.75),
	"wheat_flour": Color(0.92, 0.85, 0.55),
	"fern":        Color(0.25, 0.62, 0.22),
	"potato":      Color(0.72, 0.62, 0.30),
	"apple":       Color(0.90, 0.18, 0.12),
	"lemon":       Color(0.95, 0.90, 0.10),
	"pear":        Color(0.75, 0.82, 0.20),
	"peach":       Color(0.95, 0.62, 0.30),
	"honey":       Color(0.92, 0.68, 0.05),
	"grapes":      Color(0.55, 0.18, 0.72),
	"mushroom":    Color(0.65, 0.48, 0.32),
	"bread":       Color(0.80, 0.62, 0.35),
	"pumpkin":     Color(0.90, 0.45, 0.10),
	"tomato":      Color(0.88, 0.18, 0.12),
	"cucumber":    Color(0.35, 0.72, 0.28),
}

const ITEM_COLOR: Dictionary = {
	"carrot_cake":            Color(0.90, 0.50, 0.10),
	"chicken_feed":           Color(0.78, 0.75, 0.22),
	"french_fries":           Color(0.95, 0.82, 0.20),
	"fruit_salad":            Color(0.35, 0.85, 0.35),
	"golden_potato_cake":     Color(0.92, 0.72, 0.08),
	"grape_tart_cake":        Color(0.55, 0.18, 0.72),
	"mushroom_omelette":      Color(0.72, 0.55, 0.35),
	"mushroom_soup":          Color(0.55, 0.38, 0.22),
	"pumpkin_bread":          Color(0.85, 0.45, 0.15),
	"pumpkin_spice_cake":     Color(0.90, 0.38, 0.08),
	"tomato_omelette":        Color(0.88, 0.20, 0.12),
	"upside_down_tomato_cake":Color(0.72, 0.12, 0.08),
	"veggie_salad":           Color(0.30, 0.72, 0.28),
	"wrapped_potato":         Color(0.72, 0.60, 0.35),
}

var _inv_lbl: Label = null
var _cards:   Array = []

func _ready() -> void:
	layer = 30
	_build_ui()

func _input(event: InputEvent) -> void:
	if event is InputEventKey and event.pressed and event.keycode == KEY_ESCAPE:
		get_viewport().set_input_as_handled()
		closed.emit()
		queue_free()

func _build_ui() -> void:
	var root := Control.new()
	root.set_anchors_preset(Control.PRESET_FULL_RECT)
	root.mouse_filter = Control.MOUSE_FILTER_STOP
	add_child(root)

	var dim := ColorRect.new()
	dim.set_anchors_preset(Control.PRESET_FULL_RECT)
	dim.color = Color(0, 0, 0, 0.55)
	dim.mouse_filter = Control.MOUSE_FILTER_IGNORE
	root.add_child(dim)

	var pw := 920; var ph := 580
	var panel := Control.new()
	panel.position = Vector2((1280 - pw) / 2.0, (720 - ph) / 2.0)
	panel.size     = Vector2(pw, ph)
	root.add_child(panel)

	var border := ColorRect.new()
	border.set_anchors_preset(Control.PRESET_FULL_RECT)
	border.color = BORDER_COLOR
	border.mouse_filter = Control.MOUSE_FILTER_IGNORE
	panel.add_child(border)

	var inner := ColorRect.new()
	inner.position = Vector2(1, 1)
	inner.size     = Vector2(pw - 2, ph - 2)
	inner.color    = Color(0.07, 0.07, 0.09, 0.98)
	inner.mouse_filter = Control.MOUSE_FILTER_IGNORE
	panel.add_child(inner)

	var tbar := ColorRect.new()
	tbar.position = Vector2(1, 1)
	tbar.size     = Vector2(pw - 2, 38)
	tbar.color    = Color(BORDER_COLOR.r * 0.4, BORDER_COLOR.g * 0.4, BORDER_COLOR.b * 0.4)
	tbar.mouse_filter = Control.MOUSE_FILTER_IGNORE
	panel.add_child(tbar)

	var title := Label.new()
	title.position = Vector2(16, 10)
	title.size     = Vector2(pw - 80, 22)
	title.text     = STATION_TITLE
	title.add_theme_font_size_override("font_size", 13)
	title.modulate = TITLE_COLOR
	panel.add_child(title)

	var close_btn := Button.new()
	close_btn.position = Vector2(pw - 46, 6)
	close_btn.size     = Vector2(38, 26)
	close_btn.text     = "X"
	close_btn.pressed.connect(func(): closed.emit(); queue_free())
	_pill(close_btn)
	panel.add_child(close_btn)

	_inv_lbl = Label.new()
	_inv_lbl.position = Vector2(16, 44)
	_inv_lbl.size     = Vector2(pw - 32, 18)
	_inv_lbl.add_theme_font_size_override("font_size", 9)
	_inv_lbl.modulate = Color(0.65, 0.65, 0.65)
	panel.add_child(_inv_lbl)

	var scroll := ScrollContainer.new()
	scroll.position = Vector2(1, 64)
	scroll.size     = Vector2(pw - 2, ph - 66)
	scroll.horizontal_scroll_mode = ScrollContainer.SCROLL_MODE_DISABLED
	panel.add_child(scroll)

	var vbox := VBoxContainer.new()
	vbox.custom_minimum_size = Vector2(pw - 20, 0)
	vbox.add_theme_constant_override("separation", 2)
	scroll.add_child(vbox)

	_cards.clear()
	for recipe_id in RECIPES:
		_cards.append(_make_card(vbox, recipe_id, RECIPES[recipe_id]))

	_update_inv_lbl()
	_refresh_states()

func _make_card(parent: Control, recipe_id: String, data: Dictionary) -> Dictionary:
	var card := Control.new()
	card.custom_minimum_size = Vector2(0, 115)
	card.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	parent.add_child(card)

	var cbg := ColorRect.new()
	cbg.set_anchors_preset(Control.PRESET_FULL_RECT)
	cbg.color = Color(0.10, 0.10, 0.13)
	cbg.mouse_filter = Control.MOUSE_FILTER_IGNORE
	card.add_child(cbg)

	var strip := ColorRect.new()
	strip.position = Vector2(0, 0)
	strip.size     = Vector2(5, 110)
	strip.color    = ITEM_COLOR.get(recipe_id, BORDER_COLOR)
	strip.mouse_filter = Control.MOUSE_FILTER_IGNORE
	card.add_child(strip)

	var out_icon := TextureRect.new()
	out_icon.position     = Vector2(6, 8)
	out_icon.size         = Vector2(38, 38)
	out_icon.expand_mode  = TextureRect.EXPAND_IGNORE_SIZE
	out_icon.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
	out_icon.mouse_filter = Control.MOUSE_FILTER_IGNORE
	var _out_path := "res://assets/sprites/items/%s.png" % recipe_id
	if ResourceLoader.exists(_out_path):
		out_icon.texture = load(_out_path)
	card.add_child(out_icon)

	var name_lbl := Label.new()
	name_lbl.position = Vector2(48, 8)
	name_lbl.size     = Vector2(600, 20)
	name_lbl.text     = recipe_id.replace("_", " ").to_upper()
	name_lbl.add_theme_font_size_override("font_size", 11)
	card.add_child(name_lbl)

	var desc_lbl := Label.new()
	desc_lbl.position  = Vector2(48, 28)
	desc_lbl.size      = Vector2(600, 18)
	desc_lbl.text      = data.get("desc", "")
	desc_lbl.add_theme_font_size_override("font_size", 8)
	desc_lbl.modulate  = Color(0.65, 0.65, 0.65)
	desc_lbl.clip_text = true
	card.add_child(desc_lbl)

	var ing: Dictionary = data.get("ing", {})
	var ing_x: float    = 14.0
	var pills: Array    = []

	for res_id in ing:
		var req: int = ing[res_id]
		var icon_path := "res://assets/sprites/items/%s.png" % res_id
		var icon_box := Control.new()
		icon_box.position = Vector2(ing_x, 46)
		icon_box.size     = Vector2(40, 40)
		icon_box.mouse_filter = Control.MOUSE_FILTER_IGNORE
		if ResourceLoader.exists(icon_path):
			var tex := TextureRect.new()
			tex.texture      = load(icon_path)
			tex.set_anchors_preset(Control.PRESET_FULL_RECT)
			tex.expand_mode  = TextureRect.EXPAND_IGNORE_SIZE
			tex.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
			tex.mouse_filter = Control.MOUSE_FILTER_IGNORE
			icon_box.add_child(tex)
		else:
			var dot := ColorRect.new()
			dot.set_anchors_preset(Control.PRESET_FULL_RECT)
			dot.color        = RES_COLOR.get(res_id, Color(0.4, 0.4, 0.4))
			dot.mouse_filter = Control.MOUSE_FILTER_IGNORE
			icon_box.add_child(dot)
		card.add_child(icon_box)

		var lbl := Label.new()
		lbl.position = Vector2(ing_x - 2, 88)
		lbl.size     = Vector2(44, 14)
		lbl.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
		lbl.add_theme_font_size_override("font_size", 8)
		lbl.text     = "x%d" % req
		card.add_child(lbl)

		pills.append({"lbl": lbl, "res_id": res_id, "req": req})
		ing_x += 50.0

	var energy_cost: int = data.get("energy", 1)
	var energy_lbl := Label.new()
	energy_lbl.position = Vector2(14, 80)
	energy_lbl.size     = Vector2(400, 16)
	energy_lbl.text     = "Energy cost: %d" % energy_cost
	energy_lbl.add_theme_font_size_override("font_size", 8)
	energy_lbl.modulate = Color(0.55, 0.90, 0.55)
	card.add_child(energy_lbl)

	var cap_id := recipe_id; var cap_data := data

	var act_btn := Button.new()
	act_btn.position = Vector2(730, 6)
	act_btn.size     = Vector2(88, 26)
	act_btn.text     = ACTION_LABEL
	act_btn.add_theme_font_size_override("font_size", 10)
	act_btn.pressed.connect(func(): _try_craft(cap_id, cap_data, 1))
	_pill(act_btn)
	card.add_child(act_btn)

	var act10_btn := Button.new()
	act10_btn.position = Vector2(730, 36)
	act10_btn.size     = Vector2(88, 26)
	act10_btn.text     = "x10"
	act10_btn.add_theme_font_size_override("font_size", 9)
	act10_btn.pressed.connect(func(): _try_craft(cap_id, cap_data, 10))
	_pill(act10_btn)
	card.add_child(act10_btn)

	var act100_btn := Button.new()
	act100_btn.position = Vector2(730, 66)
	act100_btn.size     = Vector2(88, 26)
	act100_btn.text     = "x100"
	act100_btn.add_theme_font_size_override("font_size", 9)
	act100_btn.pressed.connect(func(): _try_craft(cap_id, cap_data, 100))
	_pill(act100_btn)
	card.add_child(act100_btn)

	var sep := ColorRect.new()
	sep.set_anchors_preset(Control.PRESET_FULL_RECT)
	sep.anchor_top = 1.0; sep.anchor_bottom = 1.0
	sep.offset_top = -1;  sep.offset_bottom = 0
	sep.color = Color(0.20, 0.20, 0.25)
	sep.mouse_filter = Control.MOUSE_FILTER_IGNORE
	card.add_child(sep)

	return {"craft": act_btn, "craft10": act10_btn, "craft100": act100_btn, "pills": pills, "data": data}

func _try_craft(recipe_id: String, data: Dictionary, count: int) -> void:
	var ing: Dictionary = data.get("ing", {})
	if not _can_afford(ing, count): return
	if count == 10  and not ResourceManager.has_item("purple_potion"): return
	if count == 100 and not ResourceManager.has_item("red_potion"):    return
	var energy_per: int = data.get("energy", 1)
	if not PlayerData.spend_energy(energy_per * count): return
	if count == 10:  ResourceManager.remove_item("purple_potion")
	if count == 100: ResourceManager.remove_item("red_potion")
	for res_id in ing:
		ResourceManager.remove_item(res_id, ing[res_id] * count)
	ResourceManager.add_item(recipe_id, count)
	item_crafted.emit(recipe_id, count)
	_update_inv_lbl()
	_refresh_states()

func _can_afford(ing: Dictionary, count: int) -> bool:
	for res_id in ing:
		if ResourceManager.get_count(res_id) < ing[res_id] * count:
			return false
	return true

func _refresh_states() -> void:
	var has_purple := ResourceManager.has_item("purple_potion")
	var has_red    := ResourceManager.has_item("red_potion")
	for card_info in _cards:
		if not card_info.has("pills"): continue
		var pills: Array = card_info["pills"]
		var ing: Dictionary = {}
		for p in pills: ing[p["res_id"]] = p["req"]
		var data: Dictionary = card_info.get("data", {})
		var energy_per: int  = data.get("energy", 1)
		var has_energy: bool = PlayerData.energy >= energy_per

		var cb:  Button = card_info["craft"]
		var c10: Button = card_info["craft10"]
		if is_instance_valid(cb):
			cb.disabled = not (_can_afford(ing, 1) and has_energy)
			cb.tooltip_text = "" if has_energy else "Not enough energy (%d/%d)" % [PlayerData.energy, energy_per]
		if is_instance_valid(c10):
			var has_energy_10: bool = PlayerData.energy >= energy_per * 10
			c10.disabled = not (_can_afford(ing, 10) and has_purple and has_energy_10)
			c10.tooltip_text = "" if has_energy_10 else "Not enough energy (%d/%d)" % [PlayerData.energy, energy_per * 10]
		if card_info.has("craft100"):
			var c100: Button = card_info["craft100"]
			if is_instance_valid(c100):
				var has_energy_100: bool = PlayerData.energy >= energy_per * 100
				c100.disabled = not (_can_afford(ing, 100) and has_red and has_energy_100)
				c100.tooltip_text = "" if has_energy_100 else "Not enough energy (%d/%d)" % [PlayerData.energy, energy_per * 100]

		for p in pills:
			var lbl: Label = p["lbl"]
			if not is_instance_valid(lbl): continue
			var have: int = ResourceManager.get_count(p["res_id"])
			lbl.text     = "%d/%d" % [have, p["req"]]
			lbl.modulate = Color(0.35, 0.85, 0.45) if have >= p["req"] else Color(1.0, 0.35, 0.35)

func _update_inv_lbl() -> void:
	if not is_instance_valid(_inv_lbl): return
	var boost_txt: String = ""
	if PlayerData.has_farming_boost():
		var rem: int = PlayerData.farming_boost_remaining()
		boost_txt = "  |  Farming Boost active: %dm %ds" % [rem / 60, rem % 60]
	var parts: Array = []
	for res_id in RES_NAME:
		var c: int = ResourceManager.get_count(res_id)
		if c > 0:
			parts.append("%s: %d" % [RES_NAME[res_id], c])
	_inv_lbl.text = "Ingredients: " + (", ".join(parts) if not parts.is_empty() else "none") + boost_txt

func _pill(btn: Button) -> void:
	for sd in [
		["normal",  Color(0.09, 0.11, 0.14), Color(BORDER_COLOR.r * 0.7, BORDER_COLOR.g * 0.7, BORDER_COLOR.b * 0.7)],
		["hover",   Color(0.15, 0.18, 0.22), BORDER_COLOR],
		["pressed", Color(0.05, 0.06, 0.08), Color(BORDER_COLOR.r * 0.5, BORDER_COLOR.g * 0.5, BORDER_COLOR.b * 0.5)],
		["disabled",Color(0.08, 0.08, 0.10), Color(0.22, 0.22, 0.25)]]:
		var s := StyleBoxFlat.new()
		s.corner_radius_top_left     = 13
		s.corner_radius_top_right    = 13
		s.corner_radius_bottom_left  = 13
		s.corner_radius_bottom_right = 13
		s.border_width_left   = 1
		s.border_width_right  = 1
		s.border_width_top    = 1
		s.border_width_bottom = 1
		s.bg_color     = sd[1]
		s.border_color = sd[2]
		btn.add_theme_stylebox_override(sd[0], s)