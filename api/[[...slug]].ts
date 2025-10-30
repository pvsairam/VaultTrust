import type { VercelRequest, VercelResponse } from '@vercel/node';
import express, { Request, Response, NextFunction } from 'express';
import { registerRoutes } from '../server/routes';

const app = express();

// Comprehensive logging
console.log('[API Handler] Initializing...');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`[API] ${req.method} ${req.url} - Query:`, req.query, '- Body:', req.body);
  next();
});

// Required headers for FHEVM
app.use((req: Request, res: Response, next: NextFunction) => {
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
  next();
});

let isInitialized = false;

async function initializeApp() {
  if (!isInitialized) {
    console.log('[API Handler] Registering routes...');
    await registerRoutes(app);
    isInitialized = true;
    console.log('[API Handler] Routes registered successfully');
  }
  return app;
}

// Error handler with logging
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('[API Error]', err);
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json({ message });
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    console.log('[Vercel Handler] Incoming request:', {
      method: req.method,
      url: req.url,
      query: req.query,
      headers: req.headers,
    });
    
    const expressApp = await initializeApp();
    
    // Express expects the handler to be called as middleware
    return expressApp(req as any, res as any);
  } catch (error) {
    console.error('[Vercel Handler] Fatal error:', error);
    return res.status(500).json({ 
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
