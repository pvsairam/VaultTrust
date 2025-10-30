import type { VercelRequest, VercelResponse } from '@vercel/node';
import express from 'express';
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { eq } from 'drizzle-orm';
import { randomBytes } from 'crypto';
import * as schema from '../shared/schema.js';

// Database helper
function getDb() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL not configured');
  }
  const sql = neon(process.env.DATABASE_URL);
  return drizzle(sql, { schema });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    console.log(`[API] ${req.method} ${req.url}`);
    
    const app = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));
    
    // FHEVM headers
    app.use((_req, res, next) => {
      res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
      res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
      next();
    });
    
    // Routes
    app.post('/api/exchanges/register', async (req, res) => {
      try {
        console.log('[Register] Request body:', req.body);
        const { name, email, walletAddress } = req.body;
        
        if (!name || !email || !walletAddress) {
          return res.status(400).json({ 
            error: 'Missing required fields: name, email, walletAddress' 
          });
        }
        
        const db = getDb();
        
        // Check if exchange already exists
        const existing = await db.query.exchanges.findFirst({
          where: eq(schema.exchanges.walletAddress, walletAddress)
        });
        
        if (existing) {
          return res.status(409).json({ 
            error: 'Exchange with this wallet address already exists' 
          });
        }
        
        // Generate verification code
        const verificationCode = randomBytes(3).toString('hex').toUpperCase();
        
        // Create exchange record
        const [exchange] = await db.insert(schema.exchanges).values({
          name,
          email,
          walletAddress,
          verified: false,
          verificationCode
        }).returning();
        
        console.log('[Register] Exchange created:', exchange.id);
        
        return res.status(201).json({
          message: 'Exchange registered successfully',
          verificationCode,
          exchange: {
            id: exchange.id,
            name: exchange.name,
            email: exchange.email,
            walletAddress: exchange.walletAddress
          }
        });
      } catch (error: any) {
        console.error('[Register] Error:', error);
        return res.status(500).json({ 
          error: error.message || 'Registration failed' 
        });
      }
    });
    
    app.get('/api/exchanges/:walletAddress', async (req, res) => {
      try {
        const db = getDb();
        const exchange = await db.query.exchanges.findFirst({
          where: eq(schema.exchanges.walletAddress, req.params.walletAddress)
        });
        
        if (!exchange) {
          return res.status(404).json({ error: 'Exchange not found' });
        }
        
        return res.json(exchange);
      } catch (error: any) {
        console.error('[Get Exchange] Error:', error);
        return res.status(500).json({ error: error.message });
      }
    });
    
    app.get('/api/submissions', async (req, res) => {
      try {
        const db = getDb();
        const { userAddress } = req.query;
        
        if (userAddress) {
          const submissions = await db.query.submissions.findMany({
            where: eq(schema.submissions.userAddress, userAddress as string)
          });
          return res.json(submissions);
        }
        
        const submissions = await db.query.submissions.findMany();
        return res.json(submissions);
      } catch (error: any) {
        return res.status(500).json({ error: error.message });
      }
    });
    
    app.get('/api/audit-logs', async (req, res) => {
      try {
        const db = getDb();
        const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
        const logs = await db.query.auditLogs.findMany({
          limit,
          orderBy: (auditLogs, { desc }) => [desc(auditLogs.timestamp)]
        });
        return res.json(logs);
      } catch (error: any) {
        return res.status(500).json({ error: error.message });
      }
    });
    
    // Error handler
    app.use((err: any, _req: any, res: any, _next: any) => {
      console.error('[API Error]', err);
      res.status(500).json({ 
        error: err.message || 'Internal server error' 
      });
    });
    
    // Execute the Express app
    return app(req as any, res as any);
    
  } catch (error: any) {
    console.error('[Handler Error]', error);
    return res.status(500).json({
      error: 'API initialization failed',
      message: error.message,
      details: error.stack
    });
  }
}
