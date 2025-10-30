import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean, bigint, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const submissions = pgTable("submissions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userAddress: varchar("user_address", { length: 42 }).notNull(),
  reserveId: bigint("reserve_id", { mode: "number" }).notNull(),
  tokenSymbol: varchar("token_symbol", { length: 20 }).notNull(),
  dataType: varchar("data_type", { length: 20 }).notNull(),
  encryptedBalance: text("encrypted_balance").notNull(),
  decryptedBalance: varchar("decrypted_balance", { length: 30 }),
  transactionHash: varchar("transaction_hash", { length: 66 }).notNull(),
  blockNumber: bigint("block_number", { mode: "number" }).notNull(),
  timestamp: timestamp("timestamp").notNull(),
  verified: boolean("verified").notNull().default(false),
  verifiedBy: varchar("verified_by", { length: 42 }),
  verifiedAt: timestamp("verified_at"),
});

export const proofs = pgTable("proofs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  submissionId: varchar("submission_id").notNull().references(() => submissions.id),
  proofType: varchar("proof_type", { length: 50 }).notNull(),
  proofData: text("proof_data").notNull(),
  auditorAddress: varchar("auditor_address", { length: 42 }).notNull(),
  status: varchar("status", { length: 20 }).notNull().default("pending"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const auditLogs = pgTable("audit_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  action: varchar("action", { length: 100 }).notNull(),
  performedBy: varchar("performed_by", { length: 42 }).notNull(),
  targetAddress: varchar("target_address", { length: 42 }),
  details: text("details"),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

export const exchanges = pgTable("exchanges", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 100 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  walletAddress: varchar("wallet_address", { length: 42 }).notNull().unique(),
  verified: boolean("verified").notNull().default(false),
  verificationCode: varchar("verification_code", { length: 6 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertSubmissionSchema = createInsertSchema(submissions).omit({
  id: true,
});

export const insertProofSchema = createInsertSchema(proofs).omit({
  id: true,
  createdAt: true,
});

export const insertAuditLogSchema = createInsertSchema(auditLogs).omit({
  id: true,
  timestamp: true,
});

export const insertExchangeSchema = createInsertSchema(exchanges).omit({
  id: true,
  createdAt: true,
  verified: true,
});

export type InsertSubmission = z.infer<typeof insertSubmissionSchema>;
export type Submission = typeof submissions.$inferSelect;

export type InsertProof = z.infer<typeof insertProofSchema>;
export type Proof = typeof proofs.$inferSelect;

export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;
export type AuditLog = typeof auditLogs.$inferSelect;

export type InsertExchange = z.infer<typeof insertExchangeSchema>;
export type Exchange = typeof exchanges.$inferSelect;
