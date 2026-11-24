import { createApp } from './app.js';

// API_PORT wins in dev so a PORT meant for the Vite dev server is never shared; hosts set PORT in production.
const port = Number(process.env.API_PORT ?? process.env.PORT) || 3001;
createApp().listen(port, () => {
  console.log(`ProofCV API listening on http://localhost:${port}`);
});
