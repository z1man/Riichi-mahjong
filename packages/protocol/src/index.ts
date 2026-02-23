import { z } from "zod";

export const SeatSchema = z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3)]);
export type Seat = z.infer<typeof SeatSchema>;

export const ActionSchema = z.object({
  type: z.enum(["DISCARD", "TSUMO", "RON", "PASS"]),
  gameId: z.string(),
  playerId: z.string(),
  seq: z.number().optional(),
  tile34: z.number().int().min(0).max(33).optional(),
  declareRiichi: z.boolean().optional()
});
export type Action = z.infer<typeof ActionSchema>;

export const EventSchema = z.object({
  eventId: z.string(),
  seq: z.number().int(),
  ts: z.number().int().optional(),
  type: z.string(),
  payload: z.record(z.any()).optional()
});
export type Event = z.infer<typeof EventSchema>;

export const SnapshotSchema = z.object({
  gameId: z.string(),
  seq: z.number().int(),
  phase: z.string(),
  scores: z.tuple([z.number(), z.number(), z.number(), z.number()]),
  turnSeat: SeatSchema,
  waitingFor: z.string(),
  legalActions: z.array(z.any())
}).passthrough();
export type Snapshot = z.infer<typeof SnapshotSchema>;

export const RulesetSchema = z.object({
  startingScores: z.number().int().optional(),
  allowOpenTanyao: z.boolean().optional(),
  akaDora: z.boolean().optional()
}).passthrough();
export type Ruleset = z.infer<typeof RulesetSchema>;
