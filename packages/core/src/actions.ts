import { Action, Seat } from "@riichi/protocol";
import { GameState } from "./types";
import { removeTile } from "./tiles";

export type CoreEvent = {
  type: string;
  payload?: any;
};

export function getLegalActions(state: GameState, seat: Seat): Action[] {
  if (state.phase === "SELF_DECISION" && seat === state.turnSeat) {
    const hand = state.hands[seat];
    const actions: Action[] = [];
    for (let t = 0; t < 34; t += 1) {
      if (hand[t] > 0) {
        actions.push({ type: "DISCARD", gameId: "game", playerId: state.players[seat].playerId, tile34: t });
      }
    }
    return actions;
  }

  if (state.phase === "CALL_WINDOW" && seat !== state.turnSeat) {
    return [{ type: "PASS", gameId: "game", playerId: state.players[seat].playerId }];
  }

  return [];
}

export function applyAction(state: GameState, seat: Seat, action: Action): { state: GameState; events: CoreEvent[] } {
  const events: CoreEvent[] = [];

  if (action.type === "DISCARD") {
    if (state.phase !== "SELF_DECISION" || seat !== state.turnSeat) {
      throw new Error("not your turn");
    }
    if (typeof action.tile34 !== "number") throw new Error("tile34 required");

    removeTile(state.hands[seat], action.tile34);
    state.discards[seat].push(action.tile34);
    events.push({ type: "DISCARDED", payload: { seat, tile34: action.tile34 } });

    // open call window (MVP: no ron handled here)
    state.phase = "CALL_WINDOW";
    events.push({ type: "CALL_WINDOW_OPENED", payload: { fromSeat: seat, tile34: action.tile34 } });

    // close immediately in MVP (no ron/pon/chi)
    state.phase = "CALL_WINDOW";
    events.push({ type: "CALL_WINDOW_CLOSED" });

    // advance to next seat and draw
    const nextSeat = ((seat + 1) % 4) as Seat;
    state.turnSeat = nextSeat;

    if (state.wallIndex >= state.wall.length) {
      state.phase = "ROUND_END";
      events.push({ type: "HAND_ENDED", payload: { result: "DRAW" } });
      return { state, events };
    }

    const drawn = state.wall[state.wallIndex++];
    state.hands[nextSeat][drawn] += 1;
    state.phase = "SELF_DECISION";
    events.push({ type: "DRAWN", payload: { seat: nextSeat, tile34: drawn } });
    return { state, events };
  }

  if (action.type === "PASS") {
    // No-op in MVP (call window auto-closes). Keep for future.
    return { state, events };
  }

  throw new Error("unsupported action in MVP");
}
