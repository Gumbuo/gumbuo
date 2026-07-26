extends StaticBody3D
class_name GlobeTile

# 3D equivalent of the old flat TileCard: a terrain-textured polygon sitting
# flush on the geodesic sphere's surface (see WorldGrid), with a
# StaticBody3D + ConvexPolygonShape3D so raycasts from the camera can pick
# it. Shape comes straight from the sphere geometry — WorldMap calls
# set_polygon() once after placing this tile, passing the face's actual
# corners (already projected into this tile's local tangent plane, already
# in real world units) so the mesh is exactly the true geodesic face: 6
# corners almost everywhere, 5 corners at the 12 pentagon faces. No signals
# here — WorldMap resolves picks itself via raycast and calls straight into
# LandManager, same as the old click handlers did.

const TILE_TEXTURES: Dictionary = {
	"FARM":     "res://assets/sprites/tiles/world_tile_farm_pointy.png",
	"FOREST":   "res://assets/sprites/tiles/world_tile_forest_pointy.png",
	"MOUNTAIN": "res://assets/sprites/tiles/world_tile_mountain_pointy.png",
	"POND":     "res://assets/sprites/tiles/world_tile_pond_pointy.png",
}

var TYPE_COLORS: Dictionary = {
	"FARM":     Color(0.40, 0.70, 0.30),
	"FOREST":   Color(0.20, 0.50, 0.20),
	"MOUNTAIN": Color(0.50, 0.40, 0.30),
	"POND":     Color(0.20, 0.40, 0.70),
	"GUILD":    Color(0.60, 0.40, 0.80),
}

@onready var _collision: CollisionShape3D = $CollisionShape3D
@onready var _mesh: MeshInstance3D = $Mesh
@onready var _border: MeshInstance3D = $Border
@onready var _overlay: MeshInstance3D = $Overlay
@onready var _dot: MeshInstance3D = $LocationDot

var grid_position: Vector2i = Vector2i(0, 0)
var _tile_id: String = ""
var _is_empty: bool = true
var _is_owner: bool = false
var _mat: StandardMaterial3D
var _overlay_mat: StandardMaterial3D
var _border_mat: StandardMaterial3D
var _edge_mask_mat: StandardMaterial3D
var _edge_masks: Array = []  # MeshInstance3D, one per possible edge (up to 6)
var _owned_ring_mat: StandardMaterial3D
var _owned_ring_segments: Array = []  # MeshInstance3D, one per possible edge (up to 6)
var _local_corners: PackedVector2Array = PackedVector2Array()

const WATER_BORDER_COLOR := Color(0.05, 0.06, 0.05, 1.0)
const OWNED_BORDER_COLOR := Color(0.90, 0.12, 0.12, 0.95)

# The terrain art has a "low/high top-down" 3D-block look — a beveled wall
# painted around the edge below the flat top. That reads fine against open
# ocean but looks like a hard seam between two placed tiles sitting side by
# side. WorldMap tells us (via set_edge_occupied) which of our edges face a
# filled neighbor; for those, we paint a grass-colored strip over the outer
# band of that edge to visually erase the wall so the two tiles blend.
const EDGE_MASK_COLOR := Color(0.34, 0.50, 0.24, 1.0)
const EDGE_MASK_INNER_SCALE := 0.75

# When two+ owned tiles sit adjacent, WorldMap tells us (via set_owned_edges)
# which edges border another tile owned by the SAME player — those edges
# skip their ring segment so the outline reads as one shape around the
# whole group instead of a ring around every individual tile.
const OWNED_RING_INNER_SCALE := 0.90
const OWNED_RING_OUTER_SCALE := 1.08

# Per-type UV zoom applied via the material (not baked into the mesh, which
# always maps its true corners to the full 0..1 UV range) — each terrain
# art asset has a different amount of native margin around its actual
# hex-top content (e.g. pond's grass rim is much thinner than the others'),
# so a single shared zoom factor can't fit all of them without either
# leaving gaps or over-cropping the thinner ones.
const TERRAIN_UV_MARGIN: Dictionary = {
	"FARM":     1.1,
	"FOREST":   1.1,
	"MOUNTAIN": 1.1,
	"POND":     1.0,
}

static func _scale_corners(corners: PackedVector2Array, s: float) -> PackedVector2Array:
	var out := PackedVector2Array()
	for c in corners:
		out.append(c * s)
	return out

# Fan-triangulated polygon (5 or 6 sides, whatever the sphere face gives us)
# instead of an assumed-regular hexagon — built as real geometry, not a
# square quad + alpha, so the silhouette is crisp regardless of how the
# engine handles alpha/transparency sorting in 3D.
static func _build_polygon_mesh(corners: PackedVector2Array, uv_radius: float) -> ArrayMesh:
	var verts := PackedVector3Array()
	var uvs := PackedVector2Array()
	var normals := PackedVector3Array()
	var indices := PackedInt32Array()

	verts.append(Vector3.ZERO)
	uvs.append(Vector2(0.5, 0.5))
	normals.append(Vector3.UP)
	var n: int = corners.size()
	var r: float = max(uv_radius, 0.001)
	for c in corners:
		verts.append(Vector3(c.x, 0.0, c.y))
		uvs.append(Vector2(0.5, 0.5) + (c / r) * 0.5)
		normals.append(Vector3.UP)
	for i in range(n):
		indices.append(0)
		indices.append(1 + i)
		indices.append(1 + ((i + 1) % n))

	var arrays: Array = []
	arrays.resize(Mesh.ARRAY_MAX)
	arrays[Mesh.ARRAY_VERTEX] = verts
	arrays[Mesh.ARRAY_TEX_UV] = uvs
	arrays[Mesh.ARRAY_NORMAL] = normals
	arrays[Mesh.ARRAY_INDEX] = indices

	var mesh := ArrayMesh.new()
	mesh.add_surface_from_arrays(Mesh.PRIMITIVE_TRIANGLES, arrays)
	return mesh

# Thin border ring (a hollow annulus, not a filled polygon) sitting just
# under the terrain mesh — only ever occupies the rim strip between
# inner_scale and outer_scale of the true corners, so it reads as a border
# regardless of draw order.
static func _build_ring_mesh(corners: PackedVector2Array, inner_scale: float, outer_scale: float) -> ArrayMesh:
	var n: int = corners.size()
	var verts := PackedVector3Array()
	var normals := PackedVector3Array()
	var indices := PackedInt32Array()
	for c in corners:
		var p: Vector2 = c * inner_scale
		verts.append(Vector3(p.x, 0.0, p.y))
		normals.append(Vector3.UP)
	for c in corners:
		var p: Vector2 = c * outer_scale
		verts.append(Vector3(p.x, 0.0, p.y))
		normals.append(Vector3.UP)
	for i in range(n):
		var i0 := i
		var i1 := (i + 1) % n
		var o0 := i + n
		var o1 := ((i + 1) % n) + n
		indices.append(i0); indices.append(o0); indices.append(o1)
		indices.append(i0); indices.append(o1); indices.append(i1)

	var arrays: Array = []
	arrays.resize(Mesh.ARRAY_MAX)
	arrays[Mesh.ARRAY_VERTEX] = verts
	arrays[Mesh.ARRAY_NORMAL] = normals
	arrays[Mesh.ARRAY_INDEX] = indices

	var mesh := ArrayMesh.new()
	mesh.add_surface_from_arrays(Mesh.PRIMITIVE_TRIANGLES, arrays)
	return mesh

# A single trapezoid strip along one edge, from inner_scale*corner to
# outer_scale*corner — used both for masking that edge's wall (inner<1,
# outer=1) and for a per-edge ownership ring segment (inner<1<outer).
static func _build_edge_mask_mesh(corners: PackedVector2Array, edge_index: int, inner_scale: float, outer_scale: float = 1.0) -> ArrayMesh:
	var n: int = corners.size()
	var a: Vector2 = corners[edge_index] * outer_scale
	var b: Vector2 = corners[(edge_index + 1) % n] * outer_scale
	var ai: Vector2 = corners[edge_index] * inner_scale
	var bi: Vector2 = corners[(edge_index + 1) % n] * inner_scale

	var verts := PackedVector3Array([
		Vector3(ai.x, 0.0, ai.y), Vector3(a.x, 0.0, a.y),
		Vector3(b.x, 0.0, b.y), Vector3(bi.x, 0.0, bi.y),
	])
	var normals := PackedVector3Array([Vector3.UP, Vector3.UP, Vector3.UP, Vector3.UP])
	var indices := PackedInt32Array([0, 1, 2, 0, 2, 3])

	var arrays: Array = []
	arrays.resize(Mesh.ARRAY_MAX)
	arrays[Mesh.ARRAY_VERTEX] = verts
	arrays[Mesh.ARRAY_NORMAL] = normals
	arrays[Mesh.ARRAY_INDEX] = indices

	var mesh := ArrayMesh.new()
	mesh.add_surface_from_arrays(Mesh.PRIMITIVE_TRIANGLES, arrays)
	return mesh

func _ready() -> void:
	_mat = StandardMaterial3D.new()
	_mat.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
	_mat.cull_mode = BaseMaterial3D.CULL_DISABLED
	_mat.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
	_mat.render_priority = 0
	# Godot's 3D default (linear + mipmaps) softens pixel art badly once a
	# tile fills a big chunk of the screen up close — nearest keeps hard
	# pixel edges, mipmaps still kick in only when the tile is small/distant
	# so it doesn't shimmer from far away.
	_mat.texture_filter = BaseMaterial3D.TEXTURE_FILTER_NEAREST_WITH_MIPMAPS
	_mesh.material_override = _mat

	_border_mat = StandardMaterial3D.new()
	_border_mat.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
	_border_mat.cull_mode = BaseMaterial3D.CULL_DISABLED
	_border_mat.albedo_color = WATER_BORDER_COLOR
	_border.material_override = _border_mat

	_overlay_mat = StandardMaterial3D.new()
	_overlay_mat.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
	_overlay_mat.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
	_overlay_mat.cull_mode = BaseMaterial3D.CULL_DISABLED
	_overlay_mat.render_priority = 1
	_overlay.material_override = _overlay_mat

	var dot_mat := StandardMaterial3D.new()
	dot_mat.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
	dot_mat.albedo_color = Color(1.0, 0.15, 0.15, 0.9)
	dot_mat.render_priority = 2
	_dot.material_override = dot_mat

	_edge_mask_mat = StandardMaterial3D.new()
	_edge_mask_mat.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
	_edge_mask_mat.cull_mode = BaseMaterial3D.CULL_DISABLED
	_edge_mask_mat.albedo_color = EDGE_MASK_COLOR
	_edge_mask_mat.render_priority = 1
	for i in range(6):
		var mi := MeshInstance3D.new()
		mi.material_override = _edge_mask_mat
		mi.position = Vector3(0, 0.008, 0)
		mi.visible = false
		add_child(mi)
		_edge_masks.append(mi)

	_owned_ring_mat = StandardMaterial3D.new()
	_owned_ring_mat.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
	_owned_ring_mat.cull_mode = BaseMaterial3D.CULL_DISABLED
	_owned_ring_mat.albedo_color = OWNED_BORDER_COLOR
	_owned_ring_mat.render_priority = 1
	for i in range(6):
		var ri := MeshInstance3D.new()
		ri.material_override = _owned_ring_mat
		ri.position = Vector3(0, 0.009, 0)
		ri.visible = false
		add_child(ri)
		_owned_ring_segments.append(ri)

	set_empty()

# local_corners: this face's corners already projected into the tile's own
# local tangent-plane (x,z) coordinates, in real world units — called once
# by WorldMap right after instancing, before set_tile()/set_empty().
func set_polygon(local_corners: PackedVector2Array) -> void:
	_local_corners = local_corners
	var max_r: float = 0.001
	for c in local_corners:
		max_r = max(max_r, c.length())

	# Mesh UV always maps the polygon's true corners to the full 0..1 range —
	# per-type zoom (TERRAIN_UV_MARGIN) is applied via material uv1_scale/
	# offset in _apply_texture() instead, since different terrain art needs
	# different amounts of it.
	_mesh.mesh = _build_polygon_mesh(local_corners, max_r)
	_border.mesh = _build_ring_mesh(local_corners, 0.97, 1.05)
	_overlay.mesh = _build_polygon_mesh(_scale_corners(local_corners, 1.08), max_r * 1.08)

	var hull_points := PackedVector3Array()
	for c in local_corners:
		hull_points.append(Vector3(c.x, -0.05, c.y))
		hull_points.append(Vector3(c.x, 0.05, c.y))
	var shape := ConvexPolygonShape3D.new()
	shape.points = hull_points
	_collision.shape = shape

func set_empty() -> void:
	_tile_id = ""
	_is_empty = true
	_is_owner = false
	_mat.albedo_texture = null
	_mat.albedo_color = Color(0.05, 0.18, 0.42, 0.12)
	_overlay.visible = false
	_dot.visible = false
	if _border_mat:
		_border_mat.albedo_color = WATER_BORDER_COLOR
	if not _local_corners.is_empty():
		_border.mesh = _build_ring_mesh(_local_corners, 0.97, 1.05)
	_border.visible = true
	for m in _edge_masks:
		m.visible = false
	for r in _owned_ring_segments:
		r.visible = false

func set_tile(tile_data: Dictionary) -> void:
	_tile_id = tile_data.get("id", "")
	_is_empty = false
	_is_owner = tile_data.get("owner_id", "") == PlayerData.player_id
	var type_str: String = tile_data.get("type_str", "FARM")
	_apply_texture(TILE_TEXTURES.get(type_str, ""), TYPE_COLORS.get(type_str, Color(0.3, 0.3, 0.3)), TERRAIN_UV_MARGIN.get(type_str, 1.1))
	_dot.visible = _tile_id != "" and _tile_id == LandManager.last_tile_id
	# Owned tiles keep a bold red outline as an at-a-glance "this is yours"
	# marker — everything else stays borderless so placed land blends
	# seamlessly. This is the only always-visible cue for ownership now that
	# Edit/Move live in the click-triggered tile menu instead of always-on
	# corner buttons (not practical to keep glued to a tile on a rotating
	# globe with ~1000 of them). Drawn as per-edge segments (set_owned_edges,
	# called separately by WorldMap once it knows same-owner neighbors) so
	# adjacent owned tiles merge into one outline instead of ringing each
	# tile individually — _border itself stays hidden for owned tiles.
	_border.visible = false
	if not _is_owner:
		for r in _owned_ring_segments:
			r.visible = false

func _apply_texture(tex_path: String, fallback_color: Color, margin: float = 1.0) -> void:
	if tex_path != "" and ResourceLoader.exists(tex_path):
		_mat.albedo_texture = load(tex_path)
		_mat.albedo_color = Color(1, 1, 1, 1)
	else:
		_mat.albedo_texture = null
		_mat.albedo_color = fallback_color
	var inv: float = 1.0 / max(margin, 0.001)
	_mat.uv1_scale = Vector3(inv, inv, 1.0)
	_mat.uv1_offset = Vector3(0.5 * (1.0 - inv), 0.5 * (1.0 - inv), 0.0)

func is_empty_cell() -> bool:
	return _is_empty

func get_tile_id() -> String:
	return _tile_id

func get_is_owner() -> bool:
	return _is_owner

func set_selected(selected: bool) -> void:
	_set_overlay(selected, Color(1.0, 0.85, 0.0, 0.55))

func set_drop_target(is_target: bool) -> void:
	if not _is_empty:
		return
	_set_overlay(is_target, Color(0.0, 0.9, 0.45, 0.55))

func set_deed_hint(_show: bool) -> void:
	# No-op: an ambient green fill across every empty ocean tile (there are
	# ~1000 of them now) was overwhelming — clicking an empty tile already
	# opens the deed picker regardless of whether a hint was shown.
	pass

# occupied[i] = true if the neighbor across the edge between corner i and
# corner i+1 is itself a filled (non-empty) tile — WorldMap computes this
# from the sphere's neighbor graph and calls in whenever occupancy nearby
# changes. Only meaningful for filled tiles; empty ocean has no wall to mask.
func set_edge_occupied(occupied: Array) -> void:
	if _is_empty:
		for m in _edge_masks:
			m.visible = false
		return
	var n: int = _local_corners.size()
	for i in range(_edge_masks.size()):
		if i >= n or i >= occupied.size() or not occupied[i]:
			_edge_masks[i].visible = false
			continue
		_edge_masks[i].mesh = _build_edge_mask_mesh(_local_corners, i, EDGE_MASK_INNER_SCALE)
		_edge_masks[i].visible = true

# show[i] = true if edge i should draw its ring segment — false where the
# neighbor across that edge is owned by the same player, so the outline
# merges into one shape around the whole connected group instead of
# ringing every individual tile. Only meaningful for owned tiles.
func set_owned_edges(show: Array) -> void:
	if not _is_owner:
		for r in _owned_ring_segments:
			r.visible = false
		return
	var n: int = _local_corners.size()
	for i in range(_owned_ring_segments.size()):
		if i >= n or i >= show.size() or not show[i]:
			_owned_ring_segments[i].visible = false
			continue
		_owned_ring_segments[i].mesh = _build_edge_mask_mesh(_local_corners, i, OWNED_RING_INNER_SCALE, OWNED_RING_OUTER_SCALE)
		_owned_ring_segments[i].visible = true

func _set_overlay(show: bool, color: Color) -> void:
	if not _overlay:
		return
	_overlay.visible = show
	if show:
		_overlay_mat.albedo_color = color
