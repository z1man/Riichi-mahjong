import http from "http";
import fs from "fs";
import path from "path";
import { WebSocketServer } from "ws";
import { applyAction, buildSnapshot, createGame, getLegalActions, PlayerMeta } from "@riichi/core";
import { Action, Seat } from "@riichi/protocol";

const PORT = Number(process.env.PORT || 8080);

const server = http.createServer((req, res) => {
  if (!req.url || req.url === "/") {
    const html = fs.readFileSync(path.join(__dirname, "../public/index.html"), "utf8");
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(html);
    return;
  }
  res.writeHead(404);
  res.end();
});

const wss = new WebSocketServer({ server });

type Client = {
  seat: Seat;
  playerId: string;
  ws: WebSocket;
};

let clients: Client[] = [];
let game: ReturnType<typeof createGame> | null = null;
let seq = 0;

function broadcastSnapshot() {
  if (!game) return;
  for (const c of clients) {
    const snapshot = buildSnapshot(game, c.seat);
    const legal = getLegalActions(game, c.seat);
    snapshot.legalActions = legal;
    c.ws.send(JSON.stringify({ type: "SNAPSHOT", snapshot }));
  }
}

function ensureGame() {
  if (game) return;
  if (clients.length < 4) return;
  const players: PlayerMeta[] = clients
    .sort((a, b) => a.seat - b.seat)
    .map((c, idx) => ({ playerId: c.playerId, displayName: `P${idx + 1}` }));
  game = createGame(`seed-${Date.now()}`, {}, players);
  broadcastSnapshot();
}

wss.on("connection", (ws) => {
  const seat = clients.length as Seat;
  const playerId = `p${seat + 1}`;
  const client: Client = { seat, playerId, ws };
  clients.push(client);

  ws.send(JSON.stringify({ type: "WELCOME", seat, playerId }));
  ensureGame();
  if (game) broadcastSnapshot();

  ws.on("message", (data) => {
    if (!game) return;
    let msg: any;
    try {
      msg = JSON.parse(data.toString());
    } catch {
      return;
    }
    if (msg.type === "ACTION") {
      const action = msg.action as Action;
      // validate using legal actions
      const legal = getLegalActions(game, client.seat);
      const ok = legal.some((a) => a.type === action.type && (a.tile34 === undefined || a.tile34 === action.tile34));
      if (!ok) {
        ws.send(JSON.stringify({ type: "ERROR", message: "illegal action" }));
        return;
      }
      const result = applyAction(game, client.seat, action);
      game = result.state;
      seq += result.events.length;
      broadcastSnapshot();
    }
  });

  ws.on("close", () => {
    clients = clients.filter((c) => c !== client);
  });
});

server.listen(PORT, () => {
  console.log(`server listening on http://localhost:${PORT}`);
});
