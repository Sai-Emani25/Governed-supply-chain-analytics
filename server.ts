import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { 
  processGovernedSupplyChainQuery 
} from './src/server/governedAnalyticsService';
import { 
  SUPPLY_CHAIN_ENTITIES, 
  GOVERNED_METRICS, 
  AI_STUDIO_TOOL_DECLARATION, 
  AI_STUDIO_SYSTEM_INSTRUCTION,
  PERSONA_SCENARIOS,
  executeGovernedSemanticQuery
} from './src/data/governedOntologyData';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());

  // API Endpoints
  app.get('/api/status', (_req: Request, res: Response) => {
    res.json({
      status: 'active',
      hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
      model: 'gemini-3.8-flash',
      engine: 'Governed Supply Chain Analytics Engine',
      port: PORT
    });
  });

  app.get('/api/ontology', (_req: Request, res: Response) => {
    res.json({
      entities: SUPPLY_CHAIN_ENTITIES,
      metrics: GOVERNED_METRICS,
      toolDeclaration: AI_STUDIO_TOOL_DECLARATION,
      systemInstruction: AI_STUDIO_SYSTEM_INSTRUCTION,
      personas: PERSONA_SCENARIOS
    });
  });

  app.post('/api/chat', async (req: Request, res: Response) => {
    try {
      const { message, forceDeterministic } = req.body;
      if (!message || typeof message !== 'string') {
        res.status(400).json({ error: 'Message string is required' });
        return;
      }
      const response = await processGovernedSupplyChainQuery(message, Boolean(forceDeterministic));
      res.json(response);
    } catch (err: any) {
      console.error('Error in /api/chat:', err);
      res.status(500).json({ 
        error: 'Failed to process conversational query',
        details: err?.message 
      });
    }
  });

  app.post('/api/query-semantic', (req: Request, res: Response) => {
    try {
      const { metric_name, dimensions, filters } = req.body;
      if (!metric_name) {
        res.status(400).json({ error: 'metric_name is required' });
        return;
      }
      const result = executeGovernedSemanticQuery({
        metric_name,
        dimensions: dimensions || [],
        filters: filters || []
      });
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err?.message });
    }
  });

  app.post('/api/persona-compare', async (_req: Request, res: Response) => {
    try {
      const results = await Promise.all(
        PERSONA_SCENARIOS.map(async (persona) => {
          const run = await processGovernedSupplyChainQuery(persona.prompt, false);
          return {
            persona,
            run
          };
        })
      );
      res.json({ results });
    } catch (err: any) {
      res.status(500).json({ error: err?.message });
    }
  });

  // Vite middleware in dev or static files in production
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { 
        middlewareMode: true, 
        hmr: process.env.DISABLE_HMR !== 'true' 
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Governed Supply Chain Analytics server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
