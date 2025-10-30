import { 
  type Submission, 
  type InsertSubmission,
  type Proof,
  type InsertProof,
  type AuditLog,
  type InsertAuditLog,
  type Exchange,
  type InsertExchange,
  submissions,
  proofs,
  auditLogs,
  exchanges
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";

export interface IStorage {
  createSubmission(submission: InsertSubmission): Promise<Submission>;
  getSubmission(id: string): Promise<Submission | undefined>;
  getSubmissionsByUser(userAddress: string): Promise<Submission[]>;
  updateSubmissionVerification(id: string, verifiedBy: string, verifiedAt: Date): Promise<void>;
  getAllSubmissions(): Promise<Submission[]>;

  createProof(proof: InsertProof): Promise<Proof>;
  getProof(id: string): Promise<Proof | undefined>;
  getProofsBySubmission(submissionId: string): Promise<Proof[]>;
  updateProofStatus(id: string, status: string, completedAt?: Date): Promise<void>;

  createAuditLog(log: InsertAuditLog): Promise<AuditLog>;
  getAuditLogs(limit?: number): Promise<AuditLog[]>;

  createExchange(exchange: InsertExchange): Promise<Exchange>;
  getExchangeByWallet(walletAddress: string): Promise<Exchange | undefined>;
  getExchangeByEmail(email: string): Promise<Exchange | undefined>;
  verifyExchange(walletAddress: string, code: string): Promise<boolean>;
  getAllExchanges(): Promise<Exchange[]>;
}

export class DbStorage implements IStorage {
  async createSubmission(insertSubmission: InsertSubmission): Promise<Submission> {
    const [submission] = await db.insert(submissions).values(insertSubmission).returning();
    return submission;
  }

  async getSubmission(id: string): Promise<Submission | undefined> {
    const [submission] = await db.select().from(submissions).where(eq(submissions.id, id)).limit(1);
    return submission;
  }

  async getSubmissionsByUser(userAddress: string): Promise<Submission[]> {
    return db.select().from(submissions).where(eq(submissions.userAddress, userAddress)).orderBy(desc(submissions.timestamp));
  }

  async updateSubmissionVerification(id: string, verifiedBy: string, verifiedAt: Date): Promise<void> {
    await db.update(submissions)
      .set({ verified: true, verifiedBy, verifiedAt })
      .where(eq(submissions.id, id));
  }

  async getAllSubmissions(): Promise<Submission[]> {
    return db.select().from(submissions).orderBy(desc(submissions.timestamp));
  }

  async createProof(insertProof: InsertProof): Promise<Proof> {
    const [proof] = await db.insert(proofs).values(insertProof).returning();
    return proof;
  }

  async getProof(id: string): Promise<Proof | undefined> {
    const [proof] = await db.select().from(proofs).where(eq(proofs.id, id)).limit(1);
    return proof;
  }

  async getProofsBySubmission(submissionId: string): Promise<Proof[]> {
    return db.select().from(proofs).where(eq(proofs.submissionId, submissionId)).orderBy(desc(proofs.createdAt));
  }

  async updateProofStatus(id: string, status: string, completedAt?: Date): Promise<void> {
    await db.update(proofs)
      .set({ status, completedAt: completedAt || null })
      .where(eq(proofs.id, id));
  }

  async createAuditLog(insertLog: InsertAuditLog): Promise<AuditLog> {
    const [log] = await db.insert(auditLogs).values(insertLog).returning();
    return log;
  }

  async getAuditLogs(limit: number = 100): Promise<AuditLog[]> {
    return db.select().from(auditLogs).orderBy(desc(auditLogs.timestamp)).limit(limit);
  }

  async createExchange(insertExchange: InsertExchange): Promise<Exchange> {
    const [exchange] = await db.insert(exchanges).values(insertExchange).returning();
    return exchange;
  }

  async getExchangeByWallet(walletAddress: string): Promise<Exchange | undefined> {
    const [exchange] = await db.select().from(exchanges).where(eq(exchanges.walletAddress, walletAddress)).limit(1);
    return exchange;
  }

  async getExchangeByEmail(email: string): Promise<Exchange | undefined> {
    const [exchange] = await db.select().from(exchanges).where(eq(exchanges.email, email)).limit(1);
    return exchange;
  }

  async verifyExchange(walletAddress: string, code: string): Promise<boolean> {
    const [exchange] = await db.select().from(exchanges)
      .where(and(
        eq(exchanges.walletAddress, walletAddress),
        eq(exchanges.verificationCode, code)
      ))
      .limit(1);
    
    if (!exchange) return false;
    
    await db.update(exchanges)
      .set({ verified: true, verificationCode: null })
      .where(eq(exchanges.walletAddress, walletAddress));
    
    return true;
  }

  async getAllExchanges(): Promise<Exchange[]> {
    return db.select().from(exchanges).orderBy(desc(exchanges.createdAt));
  }
}

export const storage = new DbStorage();
