import assert from "assert";
import { createGame, hashState, validateDeal } from "../src/game";

const players = [
  { playerId: "p1", displayName: "A" },
  { playerId: "p2", displayName: "B" },
  { playerId: "p3", displayName: "C" },
  { playerId: "p4", displayName: "D" }
];

const game1 = createGame("seed-123", {}, players);
const game2 = createGame("seed-123", {}, players);
const game3 = createGame("seed-456", {}, players);

validateDeal(game1);
validateDeal(game2);

assert.strictEqual(hashState(game1), hashState(game2), "same seed should hash equal");
assert.notStrictEqual(hashState(game1), hashState(game3), "different seed should hash different");

console.log("core basic tests ok");
