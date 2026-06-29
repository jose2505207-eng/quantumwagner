import { z } from "zod";

export const nonceSchema = z.object({
  wallet_address: z.string().min(32).max(64),
});

export const verifyWalletSchema = z.object({
  wallet_address: z.string().min(32).max(64),
  signature: z.string().min(1),
  message: z.string().min(1),
});

export const createMarketSchema = z.object({
  question: z.string().min(8).max(280),
  description: z.string().max(2000).optional().default(""),
  category: z.string().max(40).optional().default("CRYPTO"),
  endTime: z.coerce.date(),
  pda: z.string().optional(),
});

export const placePredictionSchema = z.object({
  side: z.enum(["YES", "NO"]),
  amount: z.coerce.number().positive().max(1_000_000),
  txSignature: z.string().optional(),
});

export const resolveMarketSchema = z.object({
  outcome: z.enum(["YES", "NO"]),
  source: z.enum(["dev", "admin", "provider"]).default("admin"),
  adminKey: z.string().optional(),
  // Provider-mode fields: the price feed comparison that derives the outcome.
  // Required only when source === "provider"; ignored for dev/admin.
  symbol: z.string().max(40).optional(),
  comparator: z.enum(["gte", "lte"]).optional(),
  threshold: z.coerce.number().optional(),
});

export const claimQuestSchema = z.object({});

export const createFastBetSchema = z.object({
  question: z.string().min(4).max(200),
  symbol: z.string().max(20).optional().default(""),
  endTime: z.coerce.date(),
});

export const enterFastBetSchema = z.object({
  side: z.enum(["YES", "NO"]),
  amount: z.coerce.number().positive().max(1_000_000),
  txSignature: z.string().optional(),
});

export const createBattleSchema = z.object({
  title: z.string().min(4).max(120),
  description: z.string().max(1000).optional().default(""),
  sideA: z.string().max(60).optional().default("Side A"),
  sideB: z.string().max(60).optional().default("Side B"),
  pda: z.string().optional(),
});

export const joinBattleSchema = z.object({
  side: z.enum(["A", "B"]),
  amount: z.coerce.number().positive().max(1_000_000),
  txSignature: z.string().optional(),
});

export const voteBattleSchema = z.object({
  side: z.enum(["A", "B"]),
});

export const resolveBattleSchema = z.object({
  winner: z.enum(["A", "B"]),
  adminKey: z.string().optional(),
});

export const createTokenSchema = z.object({
  name: z.string().min(1).max(60),
  symbol: z.string().min(1).max(20),
  description: z.string().max(1000).optional().default(""),
  imageUri: z.string().max(500).optional().default(""),
  totalSupply: z.string().optional().default("0"),
  mint: z.string().optional(),
  txSignature: z.string().optional(),
});
