import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    console.log('[Vercel] Request:', req.method, req.url);
    
    // Dynamically import Express modules to avoid top-level crashes
    const express = (await import('express')).default;
    const { registerRoutes } = await import('../server/routes.js');
    
    console.log('[Vercel] Creating Express app');
    const app = express();
    
    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));
    
    // FHEVM headers
    app.use((req: any, res: any, next: any) => {
      res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
      res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
      next();
    });
    
    console.log('[Vercel] Registering routes');
    await registerRoutes(app);
    
    console.log('[Vercel] Processing request');
    return app(req as any, res as any);
    
  } catch (error: any) {
    console.error('[Vercel] CRASH:', error);
    
    return res.status(500).json({
      error: 'Function initialization failed',
      message: error?.message || 'Unknown error',
      stack: error?.stack,
      env: {
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        nodeVersion: process.version
      }
    });
  }
}
