import crypto from "crypto";
import { rngShuffle, seedRng } from "./rng";
import { addTile, emptyHand, makeWall34, totalTiles } from "./tiles";
import { GameState, PlayerMeta, Ruleset, Seat } from "./types";

const DEFAULT_RULESET: Ruleset = {
  startingScores: 25000,
  allowOpenTanyao: false,
  akaDora: false
};

export function createGame(seed: string, ruleset: Partial<Ruleset>, players: PlayerMeta[]): GameState {
  if (players.length !== 4) throw new Error("players must be 4");
  const rng = seedRng(seed);
  const wallBase = makeWall34();
  const shuffled = rngShuffle(rng, wallBase);

  const hands = [emptyHand(), emptyHand(), emptyHand(), emptyHand()];
  let wallIndex = 0;

  for (let round = 0; round < 13; round += 1) {
    for (let seat = 0; seat < 4; seat += 1) {
      addTile(hands[seat], shuffled.list[wallIndex++]);
    }
  }
  // dealer draw
  const dealerSeat: Seat = 0;
  addTile(hands[dealerSeat], shuffled.list[wallIndex++]);

  const scores: [number, number, number, number] = [
    DEFAULT_RULESET.startingScores,
    DEFAULT_RULESET.startingScores,
    DEFAULT_RULESET.startingScores,
    DEFAULT_RULESET.startingScores
  ];

  return {
    seed,
    rng: shuffled.state,
    phase: "SELF_DECISION",
    dealerSeat,
    turnSeat: dealerSeat,
    roundWind: 0,
    honba: 0,
    riichiSticks: 0,
    scores,
    wall: shuffled.list,
    wallIndex,
    hands,
    discards: [[], [], [], []],
    riichi: [false, false, false, false],
    players
  };
}

export function buildSnapshot(state: GameState, viewerSeat: Seat) {
  return {
    gameId: "game",
    seq: 0,
    phase: state.phase,
    round: {
      dealerSeat: state.dealerSeat,
      roundWind: state.roundWind,
      honba: state.honba,
      riichiSticks: state.riichiSticks,
      tilesLeft: state.wall.length - state.wallIndex
    },
    scores: state.scores,
    hands: state.hands.map((h, idx) => (idx === viewerSeat ? h : null)),
    discards: state.discards,
    riichi: state.riichi,
    turnSeat: state.turnSeat,
    waitingFor: "SELF_ACTION",
    legalActions: []
  };
}

export function hashState(state: GameState): string {
  const payload = {
    seed: state.seed,
    rng: state.rng,
    phase: state.phase,
    dealerSeat: state.dealerSeat,
    turnSeat: state.turnSeat,
    roundWind: state.roundWind,
    honba: state.honba,
    riichiSticks: state.riichiSticks,
    scores: state.scores,
    wallIndex: state.wallIndex,
    wall: state.wall,
    hands: state.hands,
    discards: state.discards,
    riichi: state.riichi
  };
  const json = JSON.stringify(payload);
  return crypto.createHash("sha256").update(json).digest("hex");
}

export function validateDeal(state: GameState) {
  for (let seat = 0; seat < 4; seat += 1) {
    const count = totalTiles(state.hands[seat]);
    if (seat === state.dealerSeat && count !== 14) throw new Error("dealer must have 14 tiles");
    if (seat !== state.dealerSeat && count !== 13) throw new Error("non-dealer must have 13 tiles");
  }
}
