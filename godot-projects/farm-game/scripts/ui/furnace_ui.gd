extends CanvasLayer

signal closed
signal item_crafted(item_id: String, count: int)

# ─────────────────────────── RECIPE DATA ────────────────────
# Ingredient quantities are estimated — update when confirmed.
# x10 requires 1 purple_potion; x100 requires 1 red_potion.

const RECIPES: Dictionary = {
	"iron_ingot":   {"desc": "Smelted iron. Used in Iron-tier tools and weapons.",  "ing": {"wood": 1, "iron_ore": 1},   "energy": 3},
	"silver_ingot": {"desc": "Smelted silver. Used in Silver-tier crafting.",        "ing": {"wood": 1, "silver_ore": 1}, "energy": 3},
	"gold_ingot":   {"desc": "Smelted gold. Used in Gold-tier crafting.",            "ing": {"wood": 1, "gold_ore": 1},   "energy": 3},
	"clay_brick":   {"desc": "Fired clay brick. Used in construction.",              "ing": {"clay": 1},                  "energy": 3},
}

const RES_NAME: Dictionary = {
	"wood": "Wood", "iron_ore": "Iron Ore", "silver_ore": "Silver Ore", "gold_ore": "Gold Ore", "clay": "Clay",
}

const RES_COLOR: Dictionary = {
	"wood":       Color(0.60, 0.45, 0.25),
	"iron_ore":   Color(0.45, 0.38, 0.32),
	"silver_ore": Color(0.62, 0.62, 0.68),
	"gold_ore":   Color(0.78, 0.65, 0.08),
	"clay":       Color(0.68, 0.45, 0.30),
}

const ITEM_COLOR: Dictionary = {
	"iron_ingot":   Color(0.55, 0.55, 0.62),
	"silver_ingot": Color(0.75, 0.75, 0.82),
	"gold_ingot":   Color(0.95, 0.80, 0.10),
	"clay_brick":   Color(0.68, 0.45, 0.30),
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

	var pw := 920; var ph := 420
	var panel := Control.new()
	panel.position = Vector2((1280 - pw) / 2.0, (720 - ph) / 2.0)
	panel.size     = Vector2(pw, ph)
	root.add_child(panel)

	var border := ColorRect.new()
	border.set_anchors_preset(Control.PRESET_FULL_RECT)
	border.color = Color(0.50, 0.22, 0.05)
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
	tbar.color    = Color(0.18, 0.08, 0.02)
	tbar.mouse_filter = Control.MOUSE_FILTER_IGNORE
	panel.add_child(tbar)

	var title := Label.new()
	title.position = Vector2(16, 10)
	title.size     = Vector2(pw - 80, 22)
	title.text     = "FURNACE"
	title.add_theme_font_size_override("font_size", 13)
	title.modulate = Color(1.0, 0.65, 0.25)
	panel.add_child(title)

	var close_btn := Button.new()
	close_btn.position = Vector2(pw - 46, 6)
	close_btn.size     = Vector2(38, 26)
	close_btn.text     = "X"
	close_btn.pressed.connect(func(): closed.emit(); queue_free())
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
	card.custom_minimum_size = Vector2(0, 110)
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

	var name_lbl := Label.new()
	name_lbl.position = Vector2(14, 8)
	name_lbl.size     = Vector2(600, 20)
	name_lbl.text     = recipe_id.replace("_", " ").to_upper()
	name_lbl.add_theme_font_size_override("font_size", 11)
	card.add_child(name_lbl)

	var desc_lbl := Label.new()
	desc_lbl.position  = Vector2(14, 28)
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
		var dot := ColorRect.new()
		dot.position = Vector2(ing_x, 54)
		dot.size     = Vector2(10, 10)
		dot.color    = RES_COLOR.get(res_id, Color(0.4, 0.4, 0.4))
		dot.mouse_filter = Control.MOUSE_FILTER_IGNORE
		card.add_child(dot)

		var lbl := Label.new()
		lbl.position = Vector2(ing_x + 13, 50)
		lbl.size     = Vector2(155, 16)
		lbl.add_theme_font_size_override("font_size", 9)
		lbl.text     = "%s %d" % [RES_NAME.get(res_id, res_id), req]
		card.add_child(lbl)

		pills.append({"lbl": lbl, "dot": dot, "res_id": res_id, "req": req})
		ing_x += 170.0

	var cap_id := recipe_id; var cap_data := data

	var smelt_btn := Button.new()
	smelt_btn.position = Vector2(730, 6)
	smelt_btn.size     = Vector2(88, 26)
	smelt_btn.text     = "SMELT"
	smelt_btn.add_theme_font_size_override("font_size", 10)
	smelt_btn.pressed.connect(func(): _try_craft(cap_id, cap_data, 1))
	card.add_child(smelt_btn)

	var smelt10_btn := Button.new()
	smelt10_btn.position = Vector2(730, 36)
	smelt10_btn.size     = Vector2(88, 26)
	smelt10_btn.text     = "x10"
	smelt10_btn.add_theme_font_size_override("font_size", 9)
	smelt10_btn.pressed.connect(func(): _try_craft(cap_id, cap_data, 10))
	card.add_child(smelt10_btn)

	var smelt100_btn := Button.new()
	smelt100_btn.position = Vector2(730, 66)
	smelt100_btn.size     = Vector2(88, 26)
	smelt100_btn.text     = "x100"
	smelt100_btn.add_theme_font_size_override("font_size", 9)
	smelt100_btn.pressed.connect(func(): _try_craft(cap_id, cap_data, 100))
	card.add_child(smelt100_btn)

	var sep := ColorRect.new()
	sep.set_anchors_preset(Control.PRESET_FULL_RECT)
	sep.anchor_top = 1.0; sep.anchor_bottom = 1.0
	sep.offset_top = -1;  sep.offset_bottom = 0
	sep.color = Color(0.20, 0.20, 0.25)
	sep.mouse_filter = Control.MOUSE_FILTER_IGNORE
	card.add_child(sep)

	return {"craft": smelt_btn, "craft10": smelt10_btn, "craft100": smelt100_btn, "pills": pills}

# ─────────────────────────── CRAFTING ───────────────────────

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
			lbl.text     = "%s %d/%d" % [RES_NAME.get(p["res_id"], p["res_id"]), have, p["req"]]
			lbl.modulate = Color(0.3, 0.7, 1.0) if have >= p["req"] else Color(1.0, 0.4, 0.4)

func _update_inv_lbl() -> void:
	if not is_instance_valid(_inv_lbl): return
	var parts: Array = []
	for res_id in RES_NAME:
		var c: int = ResourceManager.get_count(res_id)
		if c > 0:
			parts.append("%s: %d" % [RES_NAME[res_id], c])
	_inv_lbl.text = "Materials: " + (", ".join(parts) if not parts.is_empty() else "none — mine iron/silver/gold ore and coal to smelt")
