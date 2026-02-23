export type Seat = 0 | 1 | 2 | 3;

export type Phase =
  | "ROUND_INIT"
  | "DRAW"
  | "SELF_DECISION"
  | "CALL_WINDOW"
  | "ROUND_END"
  | "GAME_END";

export type Ruleset = {
  startingScores: number;
  allowOpenTanyao: boolean;
  akaDora: boolean;
};

export type PlayerMeta = {
  playerId: string;
  displayName: string;
};

export type GameState = {
  seed: string;
  rng: RNGState;
  phase: Phase;
  dealerSeat: Seat;
  turnSeat: Seat;
  roundWind: number;
  honba: number;
  riichiSticks: number;
  scores: [number, number, number, number];
  wall: number[]; // tile34 instances (length 136)
  wallIndex: number;
  hands: number[][]; // [seat][tile34]=count
  discards: number[][]; // [seat] array of tile34
  riichi: boolean[];
  players: PlayerMeta[];
};

export type RNGState = {
  a: number;
  b: number;
  c: number;
  d: number;
};
