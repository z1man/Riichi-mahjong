import assert from "assert";
import { applyAction, createGame, getLegalActions } from "../src";

const players = [
  { playerId: "p1", displayName: "A" },
  { playerId: "p2", displayName: "B" },
  { playerId: "p3", displayName: "C" },
  { playerId: "p4", displayName: "D" }
];

const state = createGame("seed-abc", {}, players);

// dealer must have legal discards
const legal = getLegalActions(state, 0);
assert(legal.length > 0, "dealer should have legal discards");

// make a discard
const first = legal[0];
const beforeWall = state.wallIndex;
const result = applyAction(state, 0, first);

// after discard, next seat should draw
assert.strictEqual(result.state.turnSeat, 1, "turn should advance to next seat");
assert(result.state.wallIndex === beforeWall + 1, "wall index should advance by 1 (draw)");

console.log("core turn tests ok");
