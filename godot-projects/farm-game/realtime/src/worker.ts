export { TileRoom } from "./tile-room";

export interface Env {
  TILE_ROOM: DurableObjectNamespace;
}

// Godot connects to wss://<worker-host>/room/<tile_id> — every connection
// with the same tile_id lands on the same Durable Object instance
// (idFromName gives a stable, deterministic id per name).
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const match = url.pathname.match(/^\/room\/([^/]+)$/);
    if (!match) {
      return new Response("Not found — expected /room/<tile_id>", { status: 404 });
    }
    const tileId = decodeURIComponent(match[1]);
    const id = env.TILE_ROOM.idFromName(tileId);
    const stub = env.TILE_ROOM.get(id);
    return stub.fetch(request);
  },
};
