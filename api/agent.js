// Vercel serverless entry for the AI resume agent. Same handler as the Express route.
import { handleAgentRequest } from '../server/src/agent.js';

export default handleAgentRequest;
