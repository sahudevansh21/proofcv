import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PRESETS, SAMPLE_RESUME, SAMPLES, SKILLS } from '@proofcv/shared';
import { handleAgentRequest } from './agent.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.resolve(here, '../../client/dist');

/**
 * The audit API never accepts resume text: all analysis runs in the browser, so "your resume never
 * leaves your browser" stays true for audits. The only exception is the opt-in AI resume agent
 * (/api/agent), which sends interview answers to Anthropic's API and is labelled as such in the UI.
 */
export function createApp({ serveClient = fs.existsSync(DIST) } = {}) {
  const app = express();
  app.disable('x-powered-by');
  app.use((req, res, next) => {
    res.set('X-Content-Type-Options', 'nosniff');
    res.set('Referrer-Policy', 'no-referrer');
    next();
  });

  const api = express.Router();
  api.get('/health', (req, res) => res.json({ ok: true }));
  api.get('/presets', (req, res) => {
    res.set('Cache-Control', 'public, max-age=300');
    res.json({ sampleResume: SAMPLE_RESUME, presets: PRESETS, samples: SAMPLES });
  });
  api.get('/skills', (req, res) => {
    res.set('Cache-Control', 'public, max-age=300');
    res.json({
      count: SKILLS.length,
      skills: SKILLS.map(({ name, category, aliases }) => ({ name, category, aliases })),
    });
  });
  api.post('/agent', express.json({ limit: '64kb' }), handleAgentRequest);
  api.use((req, res) => res.status(404).json({ error: 'Not found' }));
  app.use('/api', api);

  if (serveClient) {
    app.use(express.static(DIST, { index: false, maxAge: '1h' }));
    app.get('*', (req, res) => res.sendFile(path.join(DIST, 'index.html')));
  }

  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  });
  return app;
}
