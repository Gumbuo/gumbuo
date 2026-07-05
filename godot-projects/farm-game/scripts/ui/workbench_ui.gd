extends CanvasLayer

signal closed
signal item_crafted(item_id: String, count: int)

# ─────────────────────────── RECIPE DATA ────────────────────
# Ingredient quantities are estimated — update when confirmed.
# x10 requires 1 purple_potion; x100 requires 1 red_potion.

const RECIPES: Dictionary = {
	"alchemy_table":       {"desc": "Use an alchemy table to produce potions.",               "ing": {"wood_plank": 3000, "clay_brick": 50,    "silver_ingot": 10}},
	"anvil":               {"desc": "Use an anvil to craft metal objects.",                    "ing": {"wood_plank": 200,  "iron_ingot": 10}},
	"barrel":              {"desc": "Use a barrel to ferment grape juice into wine.",          "ing": {"wood_plank": 15000, "iron_ingot": 15}},
	"beehive":             {"desc": "Use a beehive to raise bees.",                           "ing": {"wood_plank": 5000, "iron_ingot": 10,   "cotton_thread": 100}},
	"bonfire":             {"desc": "Use a bonfire to prepare food and drinks.",              "ing": {"wood": 100}},
	"box":                 {"desc": "Store your items. Only you can access your box.",         "ing": {"wood_plank": 10}},
	"bread_oven":          {"desc": "Use a bread oven to bake bread.",                        "ing": {"wood_plank": 10000, "stone_brick": 100000, "clay": 200}},
	"chicken_coop":        {"desc": "Use a chicken coop to raise chickens.",                  "ing": {"wood_plank": 10000}},
	"dyeing_vat":          {"desc": "Use a dyeing vat to dye wool.",                         "ing": {"wood_plank": 500,  "stone_brick": 1500}},
	"furnace":             {"desc": "Use a furnace to produce metal bars.",                   "ing": {"wood_plank": 1200, "stone_brick": 10000, "clay": 200}},
	"gold_fishing_rod":    {"desc": "Strong odds for rare/epic fish. Breaks after 90 uses.", "ing": {"wood_plank": 1, "gold_ingot": 1}},
	"iron_fishing_rod":    {"desc": "Basic fishing rod. Breaks after 30 uses.",              "ing": {"wood_plank": 1, "iron_ingot": 1}},
	"sawmill":             {"desc": "Use a sawmill to produce wood planks.",                  "ing": {"wood": 50000, "silver_ingot": 100}},
	"silver_fishing_rod":  {"desc": "Better odds for rare/epic fish. Breaks after 60 uses.","ing": {"wood_plank": 1, "silver_ingot": 1}},
	"soil_plot":           {"desc": "Place on Farm Tile to create a tillable farm plot.",    "ing": {"carrot": 10, "fern": 10, "blue_flower": 10, "yellow_flower": 10}},
	"spinning_wheel":      {"desc": "Use a spinning wheel to produce wool.",                 "ing": {"wood_plank": 1500}},
	"stonecutter":         {"desc": "Use a stonecutter to produce stone blocks.",            "ing": {"wood_plank": 100000, "silver_ingot": 100}},
	"wine_press":          {"desc": "Use a wine press to produce grape must.",               "ing": {"wood_plank": 5000, "iron_ingot": 5}},
}

const RES_NAME: Dictionary = {
	"wood":          "Wood",          "wood_plank":    "Wood Plank",
	"clay":          "Clay",          "clay_brick":    "Clay Brick",
	"stone_brick":   "Stone Brick",   "iron_ingot":    "Iron Ingot",
	"silver_ingot":  "Silver Ingot",  "gold_ingot":    "Gold Ingot",
	"cotton":        "Cotton",        "cotton_thread": "Cotton Thread",
	"sapphire":      "Sapphire",
	"carrot":        "Carrot",        "fern":          "Fern",
	"blue_flower":   "Blue Flower",   "yellow_flower": "Yellow Flower",
}

const RES_COLOR: Dictionary = {
	"wood":          Color(0.55, 0.35, 0.15),
	"wood_plank":    Color(0.72, 0.52, 0.28),
	"clay":          Color(0.70, 0.40, 0.22),
	"clay_brick":    Color(0.72, 0.30, 0.20),
	"stone_brick":   Color(0.55, 0.52, 0.48),
	"iron_ingot":    Color(0.55, 0.55, 0.62),
	"silver_ingot":  Color(0.75, 0.75, 0.82),
	"gold_ingot":    Color(0.95, 0.80, 0.10),
	"cotton":        Color(0.92, 0.92, 0.88),
	"cotton_thread": Color(0.88, 0.82, 0.70),
	"sapphire":      Color(0.20, 0.40, 0.88),
	"carrot":        Color(0.90, 0.50, 0.10),
	"fern":          Color(0.25, 0.62, 0.22),
	"blue_flower":   Color(0.30, 0.55, 0.92),
	"yellow_flower": Color(0.95, 0.88, 0.10),
}

const ITEM_COLOR: Dictionary = {
	"alchemy_table":       Color(0.42, 0.18, 0.65),
	"anvil":               Color(0.40, 0.40, 0.42),
	"barrel":              Color(0.48, 0.30, 0.12),
	"beehive":             Color(0.92, 0.75, 0.10),
	"bonfire":             Color(0.95, 0.38, 0.05),
	"box":                 Color(0.60, 0.42, 0.22),
	"bread_oven":          Color(0.78, 0.55, 0.30),
	"chicken_coop":        Color(0.85, 0.72, 0.30),
	"dyeing_vat":          Color(0.55, 0.18, 0.55),
	"furnace":             Color(0.65, 0.20, 0.10),
	"gold_fishing_rod":    Color(0.95, 0.80, 0.10),
	"iron_fishing_rod":    Color(0.55, 0.55, 0.62),
	"sawmill":             Color(0.48, 0.32, 0.15),
	"silver_fishing_rod":  Color(0.75, 0.75, 0.82),
	"spinning_wheel":      Color(0.78, 0.72, 0.85),
	"stonecutter":         Color(0.50, 0.48, 0.45),
	"wine_press":          Color(0.55, 0.12, 0.35),
}

# ─────────────────────────── UI STATE ───────────────────────

var _inv_lbl: Label = null
var _cards:   Array = []

# ─────────────────────────── INIT ───────────────────────────

func _ready() -> void:
	layer = 30
	_build_ui()

func _input(event: InputEvent) -> void:
	if event is InputEventKey and event.pressed and event.keycode == KEY_ESCAPE:
		get_viewport().set_input_as_handled()
		closed.emit()
		queue_free()

# ─────────────────────────── BUILD UI ───────────────────────

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
	border.color = Color(0.28, 0.28, 0.35)
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
	tbar.color    = Color(0.12, 0.12, 0.16)
	tbar.mouse_filter = Control.MOUSE_FILTER_IGNORE
	panel.add_child(tbar)

	var title := Label.new()
	title.position = Vector2(16, 10)
	title.size     = Vector2(pw - 80, 22)
	title.text     = "WORKBENCH"
	title.add_theme_font_size_override("font_size", 13)
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
	_update_inv_lbl()

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

	_refresh_states()

# ─────────────────────────── RECIPE CARD ────────────────────

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
	strip.color    = ITEM_COLOR.get(recipe_id, Color(0.4, 0.4, 0.4))
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
	name_lbl.size     = Vector2(560, 20)
	name_lbl.text     = recipe_id.replace("_", " ").to_upper()
	name_lbl.add_theme_font_size_override("font_size", 11)
	card.add_child(name_lbl)

	var desc_lbl := Label.new()
	desc_lbl.position  = Vector2(48, 28)
	desc_lbl.size      = Vector2(580, 18)
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

	var cap_id := recipe_id; var cap_data := data

	var craft_btn := Button.new()
	craft_btn.position = Vector2(720, 6)
	craft_btn.size     = Vector2(88, 26)
	craft_btn.text     = "CRAFT"
	craft_btn.add_theme_font_size_override("font_size", 10)
	craft_btn.pressed.connect(func(): _try_craft(cap_id, cap_data, 1))
	_pill(craft_btn)
	card.add_child(craft_btn)

	var craft10_btn := Button.new()
	craft10_btn.position = Vector2(720, 36)
	craft10_btn.size     = Vector2(88, 26)
	craft10_btn.text     = "x10"
	craft10_btn.add_theme_font_size_override("font_size", 9)
	craft10_btn.pressed.connect(func(): _try_craft(cap_id, cap_data, 10))
	_pill(craft10_btn)
	card.add_child(craft10_btn)

	var craft100_btn := Button.new()
	craft100_btn.position = Vector2(720, 66)
	craft100_btn.size     = Vector2(88, 26)
	craft100_btn.text     = "x100"
	craft100_btn.add_theme_font_size_override("font_size", 9)
	craft100_btn.pressed.connect(func(): _try_craft(cap_id, cap_data, 100))
	_pill(craft100_btn)
	card.add_child(craft100_btn)

	var sep := ColorRect.new()
	sep.set_anchors_preset(Control.PRESET_FULL_RECT)
	sep.anchor_top = 1.0; sep.anchor_bottom = 1.0
	sep.offset_top = -1;  sep.offset_bottom = 0
	sep.color = Color(0.20, 0.20, 0.25)
	sep.mouse_filter = Control.MOUSE_FILTER_IGNORE
	card.add_child(sep)

	return {"craft": craft_btn, "craft10": craft10_btn, "craft100": craft100_btn, "pills": pills}

# ─────────────────────────── CRAFTING ───────────────────────

func _try_craft(recipe_id: String, data: Dictionary, count: int) -> void:
	var ing: Dictionary = data.get("ing", {})
	if not _can_afford(ing, count): return
	if count == 10  and not ResourceManager.has_item("purple_potion"): return
	if count == 100 and not ResourceManager.has_item("red_potion"):    return
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

# ─────────────────────────── REFRESH ────────────────────────

func _refresh_states() -> void:
	var has_purple := ResourceManager.has_item("purple_potion")
	var has_red    := ResourceManager.has_item("red_potion")
	for card_info in _cards:
		if not card_info.has("pills"): continue
		var pills: Array = card_info["pills"]
		var ing: Dictionary = {}
		for p in pills: ing[p["res_id"]] = p["req"]

		var cb:  Button = card_info["craft"]
		var c10: Button = card_info["craft10"]
		if is_instance_valid(cb):  cb.disabled  = not _can_afford(ing, 1)
		if is_instance_valid(c10): c10.disabled = not (_can_afford(ing, 10) and has_purple)
		if card_info.has("craft100"):
			var c100: Button = card_info["craft100"]
			if is_instance_valid(c100): c100.disabled = not (_can_afford(ing, 100) and has_red)

		for p in pills:
			var lbl: Label = p["lbl"]
			if not is_instance_valid(lbl): continue
			var have: int = ResourceManager.get_count(p["res_id"])
			lbl.text     = "%d/%d" % [have, p["req"]]
			lbl.modulate = Color(0.35, 0.85, 0.45) if have >= p["req"] else Color(1.0, 0.35, 0.35)

func _update_inv_lbl() -> void:
	if not is_instance_valid(_inv_lbl): return
	var parts: Array = []
	for res_id in RES_NAME:
		var c: int = ResourceManager.get_count(res_id)
		if c > 0:
			parts.append("%s: %d" % [RES_NAME[res_id], c])
	_inv_lbl.text = "Materials: " + (", ".join(parts) if not parts.is_empty() else "none — gather wood, stone, ore to craft")

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