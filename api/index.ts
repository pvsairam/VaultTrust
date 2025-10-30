import type { VercelRequest, VercelResponse } from '@vercel/node';
import express, { Request, Response, NextFunction } from 'express';
import { registerRoutes } from '../server/routes';

const app = express();

console.log('[API Init] Starting Express app initialization');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Comprehensive request logging
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`[API Request] ${req.method} ${req.url}`, {
    query: req.query,
    body: req.body,
    headers: req.headers
  });
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
    console.log('[API Init] Registering routes...');
    await registerRoutes(app);
    isInitialized = true;
    console.log('[API Init] Routes registered successfully');
  }
  return app;
}

// Error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('[API Error]', {
    error: err.message,
    stack: err.stack,
    url: req.url
  });
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json({ message });
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    console.log('[Vercel Handler] Request received:', {
      method: req.method,
      url: req.url,
      path: (req as any).path,
      env: {
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        nodeEnv: process.env.NODE_ENV
      }
    });
    
    const expressApp = await initializeApp();
    
    // Call Express as middleware
    return expressApp(req as any, res as any);
  } catch (error) {
    console.error('[Vercel Handler] Fatal error:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      error
    });
    return res.status(500).json({ 
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error',
      details: error instanceof Error ? error.stack : undefined
    });
  }
}
