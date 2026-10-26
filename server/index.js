import app from './src/app.js';

// In local execution (node index.js), start the standalone HTTP listener
if (!process.env.VERCEL) {
  import('./src/server.js');
}

export default app;
