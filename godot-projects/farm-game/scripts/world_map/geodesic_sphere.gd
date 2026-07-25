extends RefCounted
class_name GeodesicSphere

# Builds the dual of a subdivided icosahedron (a "Goldberg polyhedron"): a
# sphere tiled almost entirely by hexagons, with exactly 12 pentagons at the
# original icosahedron vertices — the same construction real geodesic domes
# and soccer balls use. Unlike wrapping a rectangular col/row grid onto a
# sphere, every face here is a genuine neighbor-sharing polygon on the
# sphere's actual surface, so there's no equator/pole size distortion.
#
# generate(subdivisions) returns Array[Dictionary], each entry:
#   { "center": Vector3 (unit sphere), "corners": Array[Vector3] (unit sphere, ordered) }
# Face count = 10*subdivisions*subdivisions + 2, of which exactly 12 are
# pentagons (5 corners) and the rest hexagons (6 corners).

const T := 1.6180339887498949  # golden ratio

static func _icosahedron() -> Dictionary:
	var raw_verts := [
		Vector3(-1, T, 0), Vector3(1, T, 0), Vector3(-1, -T, 0), Vector3(1, -T, 0),
		Vector3(0, -1, T), Vector3(0, 1, T), Vector3(0, -1, -T), Vector3(0, 1, -T),
		Vector3(T, 0, -1), Vector3(T, 0, 1), Vector3(-T, 0, -1), Vector3(-T, 0, 1),
	]
	var verts: Array = []
	for v in raw_verts:
		verts.append(v.normalized())
	var faces := [
		[0,11,5], [0,5,1], [0,1,7], [0,7,10], [0,10,11],
		[1,5,9], [5,11,4], [11,10,2], [10,7,6], [7,1,8],
		[3,9,4], [3,4,2], [3,2,6], [3,6,8], [3,8,9],
		[4,9,5], [2,4,11], [6,2,10], [8,6,7], [9,8,1],
	]
	return {"verts": verts, "faces": faces}

static func _quantize(v: Vector3) -> String:
	return "%d,%d,%d" % [roundi(v.x * 100000.0), roundi(v.y * 100000.0), roundi(v.z * 100000.0)]

static func generate(subdivisions: int) -> Array:
	var ico: Dictionary = _icosahedron()
	var base_verts: Array = ico["verts"]
	var base_faces: Array = ico["faces"]

	var verts: Array = []          # Array[Vector3], welded unique vertices on unit sphere
	var vert_index: Dictionary = {}  # quantized-pos-string -> index into verts
	var tris: Array = []           # Array[PackedInt32Array] of 3 vertex indices each

	var n: int = max(subdivisions, 1)

	for face in base_faces:
		var a: Vector3 = base_verts[face[0]]
		var b: Vector3 = base_verts[face[1]]
		var c: Vector3 = base_verts[face[2]]
		# Barycentric subdivision grid over this triangle, indices (i,j) with i+j<=n
		var grid: Dictionary = {}  # "i,j" -> welded vertex index
		for i in range(n + 1):
			for j in range(n + 1 - i):
				var k: int = n - i - j
				var p: Vector3 = (a * float(i) + b * float(j) + c * float(k)) / float(n)
				p = p.normalized()
				var key: String = _quantize(p)
				var idx: int
				if vert_index.has(key):
					idx = vert_index[key]
				else:
					idx = verts.size()
					verts.append(p)
					vert_index[key] = idx
				grid["%d,%d" % [i, j]] = idx
		for i in range(n):
			for j in range(n - i):
				var i0: int = grid["%d,%d" % [i, j]]
				var i1: int = grid["%d,%d" % [i + 1, j]]
				var i2: int = grid["%d,%d" % [i, j + 1]]
				tris.append(PackedInt32Array([i0, i1, i2]))
				var k: int = n - i - j
				if k > 1:
					var i3: int = grid["%d,%d" % [i + 1, j + 1]]
					tris.append(PackedInt32Array([i1, i3, i2]))

	# vertex -> incident triangle indices
	var incident: Array = []
	incident.resize(verts.size())
	for vi in range(verts.size()):
		incident[vi] = []
	for ti in range(tris.size()):
		var tri: PackedInt32Array = tris[ti]
		for vi in tri:
			incident[vi].append(ti)

	var faces_out: Array = []
	for vi in range(verts.size()):
		var center: Vector3 = verts[vi]
		var tri_ids: Array = incident[vi]
		if tri_ids.size() < 5:
			continue  # shouldn't happen on a valid closed mesh, but guard anyway

		var ref_up: Vector3 = Vector3.UP if abs(center.dot(Vector3.UP)) < 0.999 else Vector3.RIGHT
		var tangent_x: Vector3 = ref_up.cross(center).normalized()
		var tangent_y: Vector3 = center.cross(tangent_x).normalized()

		var corner_data: Array = []  # [{"tri": int, "pos": Vector3, "angle": float}]
		for ti in tri_ids:
			var tri: PackedInt32Array = tris[ti]
			var centroid: Vector3 = ((verts[tri[0]] + verts[tri[1]] + verts[tri[2]]) / 3.0).normalized()
			var local: Vector3 = centroid - center
			var lx: float = local.dot(tangent_x)
			var ly: float = local.dot(tangent_y)
			corner_data.append({"tri": ti, "pos": centroid, "angle": atan2(ly, lx)})

		corner_data.sort_custom(func(a, b): return a["angle"] < b["angle"])
		var corners: Array = []
		for cd in corner_data:
			corners.append(cd["pos"])

		# Neighbor between corner k and corner k+1 is the vertex shared by
		# those two angularly-consecutive incident triangles (other than vi
		# itself) — i.e. the dual face across that edge of this polygon.
		var neighbors: Array = []
		var cnt: int = corner_data.size()
		for k in range(cnt):
			var tri_a: PackedInt32Array = tris[corner_data[k]["tri"]]
			var tri_b: PackedInt32Array = tris[corner_data[(k + 1) % cnt]["tri"]]
			var shared: int = -1
			for va in tri_a:
				if va == vi:
					continue
				for vb in tri_b:
					if vb == vi:
						continue
					if va == vb:
						shared = va
						break
				if shared != -1:
					break
			neighbors.append(shared)

		faces_out.append({"center": center, "corners": corners, "neighbors": neighbors})

	return faces_out
