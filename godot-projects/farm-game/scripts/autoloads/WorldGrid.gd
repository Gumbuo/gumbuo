extends Node

# Single source of truth for the world map's geodesic hex-sphere layout.
# Built once at startup (cheap — well under a second) and shared by the
# globe renderer (world_map.gd), tile-to-tile navigation (tile_base.gd),
# and the legacy-position migration in LandManager.
#
# World-map tile positions are still stored as plain Vector2i everywhere
# (LandManager.tiles[id]["position"], LandManager.grid keys, the server
# sync payload) to avoid rewriting that machinery — but the MEANING
# changed from a (col,row) rectangular grid to an encoded face index:
#   Vector2i(face_index, -1)   → a real placement, y=-1 is the marker
#   Vector2i(-1, -1)           → "not placed" sentinel (unchanged meaning)
#   Vector2i(x>=0, y>=0)       → a pre-globe legacy (col,row) position,
#                                 remapped via legacy_to_face_index()

const GeodesicSphere := preload("res://scripts/world_map/geodesic_sphere.gd")
const SUBDIVISIONS := 10  # 10*n*n+2 = 1002 faces (990 hex + 12 pentagon)

var faces: Array = []  # Array[Dictionary]: {"center": Vector3, "corners": Array[Vector3], "neighbors": Array[int]}

func _ready() -> void:
	faces = GeodesicSphere.generate(SUBDIVISIONS)

func face_count() -> int:
	return faces.size()

func get_center(idx: int) -> Vector3:
	if idx < 0 or idx >= faces.size():
		return Vector3.ZERO
	return faces[idx]["center"]

func get_corners(idx: int) -> Array:
	if idx < 0 or idx >= faces.size():
		return []
	return faces[idx]["corners"]

func get_neighbors(idx: int) -> Array:
	if idx < 0 or idx >= faces.size():
		return []
	return faces[idx]["neighbors"]

# ── Position encoding helpers ──────────────────────────────────────────

func encode(idx: int) -> Vector2i:
	return Vector2i(idx, -1)

func is_unplaced(pos: Vector2i) -> bool:
	return pos.x < 0

func is_encoded(pos: Vector2i) -> bool:
	return pos.x >= 0 and pos.y == -1

func is_legacy(pos: Vector2i) -> bool:
	return pos.x >= 0 and pos.y >= 0

func decode(pos: Vector2i) -> int:
	return pos.x

# Deterministic hash so every client remaps the same old (col,row) position
# to the same new face index without any server coordination. `occupied`
# lets a caller batch-migrate a whole tile set with collision probing —
# pass a fresh {} per migration pass, shared across all positions in it.
func legacy_to_face_index(old_pos: Vector2i, occupied: Dictionary = {}) -> int:
	var h: int = int(old_pos.x) * 374761393 + int(old_pos.y) * 668265263
	h = (h ^ (h >> 13)) * 1274126177
	h = h ^ (h >> 16)
	var count: int = max(faces.size(), 1)
	var idx: int = abs(h) % count
	var start: int = idx
	while occupied.has(idx):
		idx = (idx + 1) % count
		if idx == start:
			break
	occupied[idx] = true
	return idx

# Normalizes any position (unplaced sentinel, already-encoded, or legacy)
# to the current encoded form. Legacy positions get remapped through
# `occupied` for collision-free batch migration.
func normalize_position(pos: Vector2i, occupied: Dictionary = {}) -> Vector2i:
	if is_unplaced(pos):
		return pos
	if is_encoded(pos):
		occupied[pos.x] = true
		return pos
	return encode(legacy_to_face_index(pos, occupied))
