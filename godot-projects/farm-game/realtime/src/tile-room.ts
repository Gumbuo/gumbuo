// One Durable Object instance per tile_id (routed by name in worker.ts, so
// every player on the same tile lands on the same instance). Pure relay —
// no game logic lives here. Combat resolution happens identically and
// independently on both clients off a shared seed broadcast through this
// same channel; this object only needs to deliver messages reliably to
// everyone else currently on the tile.
//
// Message protocol (JSON text frames):
//   Client -> room (broadcast to everyone else in the room):
//     {"type":"presence","wallet":..,"name":..,"x":..,"y":..,"facing":..}
//     {"type":"challenge","attacker":..,"defender":..,"ts":..}
//   Room -> client:
//     Same presence/challenge messages, relayed.
//     {"type":"leave","wallet":..}  — sent when a player disconnects.

export class TileRoom {
  state: DurableObjectState;
  // live socket -> wallet (null until that socket's first presence message)
  sessions: Map<WebSocket, string | null> = new Map();
  // wallet -> last presence message (raw JSON string), so a newcomer learns
  // who's already here immediately instead of waiting for their next update
  lastPresence: Map<string, string> = new Map();

  constructor(state: DurableObjectState) {
    this.state = state;
  }

  async fetch(request: Request): Promise<Response> {
    if (request.headers.get("Upgrade") !== "websocket") {
      return new Response("Expected websocket upgrade", { status: 426 });
    }

    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);
    server.accept();
    this.sessions.set(server, null);

    for (const json of this.lastPresence.values()) {
      server.send(json);
    }

    server.addEventListener("message", (event: MessageEvent) => {
      if (typeof event.data === "string") {
        this._handleMessage(server, event.data);
      }
    });
    server.addEventListener("close", () => this._handleClose(server));
    server.addEventListener("error", () => this._handleClose(server));

    return new Response(null, { status: 101, webSocket: client });
  }

  private _handleMessage(sender: WebSocket, message: string): void {
    let data: any;
    try {
      data = JSON.parse(message);
    } catch {
      return;
    }
    if (!data || typeof data.type !== "string") return;

    if (data.type === "presence" && typeof data.wallet === "string") {
      this.lastPresence.set(data.wallet, message);
      this.sessions.set(sender, data.wallet);
    }

    for (const ws of this.sessions.keys()) {
      if (ws !== sender) {
        try {
          ws.send(message);
        } catch {
          // Dead socket — its own close/error handler will clean it up.
        }
      }
    }
  }

  private _handleClose(ws: WebSocket): void {
    const wallet = this.sessions.get(ws);
    this.sessions.delete(ws);
    if (!wallet) return;
    this.lastPresence.delete(wallet);
    const leaveMsg = JSON.stringify({ type: "leave", wallet });
    for (const other of this.sessions.keys()) {
      try {
        other.send(leaveMsg);
      } catch {
        // ignore
      }
    }
  }
}
