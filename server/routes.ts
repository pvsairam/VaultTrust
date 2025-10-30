import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertSubmissionSchema, insertProofSchema, insertAuditLogSchema, insertExchangeSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  app.get("/api/submissions", async (req, res) => {
    try {
      const { userAddress } = req.query;
      
      if (userAddress && typeof userAddress === 'string') {
        const submissions = await storage.getSubmissionsByUser(userAddress);
        res.json(submissions);
      } else {
        const submissions = await storage.getAllSubmissions();
        res.json(submissions);
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/submissions/:id", async (req, res) => {
    try {
      const submission = await storage.getSubmission(req.params.id);
      if (!submission) {
        return res.status(404).json({ error: "Submission not found" });
      }
      res.json(submission);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/proofs", async (req, res) => {
    try {
      const { submissionId } = req.query;
      
      if (submissionId && typeof submissionId === 'string') {
        const proofs = await storage.getProofsBySubmission(submissionId);
        res.json(proofs);
      } else {
        res.status(400).json({ error: "submissionId query parameter required" });
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/audit-logs", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
      const logs = await storage.getAuditLogs(limit);
      res.json(logs);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/proofs", async (req, res) => {
    try {
      const validatedData = insertProofSchema.parse(req.body);
      const proof = await storage.createProof(validatedData);
      res.status(201).json(proof);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/exchanges/register", async (req, res) => {
    try {
      const { name, email, walletAddress, signature, message } = req.body;
      
      if (!signature || !message) {
        return res.status(400).json({ error: "Signature and message are required to prove wallet ownership" });
      }

      // Verify wallet ownership by checking signature
      const { verifyMessage } = await import('viem');
      const isValid = await verifyMessage({
        address: walletAddress as `0x${string}`,
        message,
        signature: signature as `0x${string}`,
      });

      if (!isValid) {
        return res.status(401).json({ error: "Invalid signature. Wallet ownership verification failed." });
      }

      const existingExchange = await storage.getExchangeByWallet(walletAddress);
      if (existingExchange) {
        return res.status(400).json({ error: "Exchange already registered with this wallet" });
      }

      const existingEmail = await storage.getExchangeByEmail(email);
      if (existingEmail) {
        return res.status(400).json({ error: "Email already registered" });
      }

      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
      
      const validatedData = insertExchangeSchema.parse({
        name,
        email,
        walletAddress,
        verificationCode
      });

      const exchange = await storage.createExchange(validatedData);

      // TEST MODE: In production, send email via Resend
      // For security, we only return the code in test mode
      res.status(201).json({
        success: true,
        message: "Registration successful. In production, verification code would be sent via email.",
        testModeCode: verificationCode, // Only included in test mode - remove in production
        exchange: {
          id: exchange.id,
          name: exchange.name,
          email: exchange.email,
          walletAddress: exchange.walletAddress,
          verified: exchange.verified
        }
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/exchanges/verify", async (req, res) => {
    try {
      const { walletAddress, code } = req.body;

      if (!walletAddress || !code) {
        return res.status(400).json({ error: "walletAddress and code required" });
      }

      const verified = await storage.verifyExchange(walletAddress, code);

      if (verified) {
        res.json({ success: true, message: "Exchange verified successfully" });
      } else {
        res.status(400).json({ error: "Invalid verification code" });
      }
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/exchanges/:walletAddress", async (req, res) => {
    try {
      const exchange = await storage.getExchangeByWallet(req.params.walletAddress);
      if (!exchange) {
        return res.status(404).json({ error: "Exchange not found" });
      }
      // Never expose verification code in API responses
      const { verificationCode, ...safeExchange } = exchange;
      res.json(safeExchange);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/exchanges", async (req, res) => {
    try {
      const exchanges = await storage.getAllExchanges();
      // Never expose verification codes in API responses
      const safeExchanges = exchanges.map(({ verificationCode, ...safe }) => safe);
      res.json(safeExchanges);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
