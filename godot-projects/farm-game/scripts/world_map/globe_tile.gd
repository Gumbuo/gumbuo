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
@onready var _npc_icon: MeshInstance3D = $NpcIcon
@onready var _overlay: MeshInstance3D = $Overlay
@onready var _dot: MeshInstance3D = $LocationDot

var grid_position: Vector2i = Vector2i(0, 0)
var _tile_id: String = ""
var _npc_id: String = ""
var _is_empty: bool = true
var _is_owner: bool = false
var _mat: StandardMaterial3D
var _overlay_mat: StandardMaterial3D

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

func _ready() -> void:
	_mat = StandardMaterial3D.new()
	_mat.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
	_mat.cull_mode = BaseMaterial3D.CULL_DISABLED
	_mat.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
	_mat.render_priority = 0
	_mesh.material_override = _mat

	var border_mat := StandardMaterial3D.new()
	border_mat.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
	border_mat.cull_mode = BaseMaterial3D.CULL_DISABLED
	border_mat.albedo_color = Color(0.05, 0.06, 0.05, 1.0)
	_border.material_override = border_mat

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

	set_empty()

# local_corners: this face's corners already projected into the tile's own
# local tangent-plane (x,z) coordinates, in real world units — called once
# by WorldMap right after instancing, before set_tile()/set_empty().
func set_polygon(local_corners: PackedVector2Array) -> void:
	var max_r: float = 0.001
	for c in local_corners:
		max_r = max(max_r, c.length())

	_mesh.mesh = _build_polygon_mesh(local_corners, max_r)
	_border.mesh = _build_ring_mesh(local_corners, 0.90, 1.12)
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
	_npc_id = ""
	_is_empty = true
	_is_owner = false
	_mat.albedo_texture = null
	_mat.albedo_color = Color(0.05, 0.18, 0.42, 0.12)
	_npc_icon.visible = false
	_overlay.visible = false
	_dot.visible = false

func set_tile(tile_data: Dictionary) -> void:
	_tile_id = tile_data.get("id", "")
	_npc_id = ""
	_is_empty = false
	_is_owner = tile_data.get("owner_id", "") == PlayerData.player_id
	var type_str: String = tile_data.get("type_str", "FARM")
	_apply_texture(TILE_TEXTURES.get(type_str, ""), TYPE_COLORS.get(type_str, Color(0.3, 0.3, 0.3)))
	_npc_icon.visible = false
	_dot.visible = _tile_id != "" and _tile_id == LandManager.last_tile_id

func set_npc_tile(npc_data: Dictionary) -> void:
	_npc_id = npc_data.get("id", "")
	_tile_id = ""
	_is_empty = false
	_is_owner = false
	var terrain: String = npc_data.get("terrain", "")
	var col: Array = npc_data.get("color", [0.8, 0.7, 0.2])
	_apply_texture(TILE_TEXTURES.get(terrain, ""), Color(col[0], col[1], col[2]))

	var standing_path: String = npc_data.get("standing", "")
	if standing_path != "" and ResourceLoader.exists(standing_path):
		var npc_mat := StandardMaterial3D.new()
		npc_mat.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
		npc_mat.albedo_texture = load(standing_path)
		npc_mat.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
		npc_mat.cull_mode = BaseMaterial3D.CULL_DISABLED
		npc_mat.render_priority = 1
		_npc_icon.material_override = npc_mat
		_npc_icon.visible = true
	else:
		_npc_icon.visible = false
	_dot.visible = false

func _apply_texture(tex_path: String, fallback_color: Color) -> void:
	if tex_path != "" and ResourceLoader.exists(tex_path):
		_mat.albedo_texture = load(tex_path)
		_mat.albedo_color = Color(1, 1, 1, 1)
	else:
		_mat.albedo_texture = null
		_mat.albedo_color = fallback_color

func is_empty_cell() -> bool:
	return _is_empty

func is_npc_tile() -> bool:
	return _npc_id != ""

func get_tile_id() -> String:
	return _tile_id

func get_npc_id() -> String:
	return _npc_id

func get_is_owner() -> bool:
	return _is_owner

func set_selected(selected: bool) -> void:
	_set_overlay(selected, Color(1.0, 0.85, 0.0, 0.55))

func set_drop_target(is_target: bool) -> void:
	if not _is_empty:
		return
	_set_overlay(is_target, Color(0.0, 0.9, 0.45, 0.55))

func set_deed_hint(show: bool) -> void:
	if not _is_empty:
		return
	_set_overlay(show, Color(0.55, 0.85, 0.40, 0.35))

func _set_overlay(show: bool, color: Color) -> void:
	if not _overlay:
		return
	_overlay.visible = show
	if show:
		_overlay_mat.albedo_color = color
