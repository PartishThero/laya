import http from 'http';
import app from './app.js';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 5001;

const server = http.createServer(app);

// Only bind to a TCP port when running standalone process locally (npm start / npm run dev).
// On Vercel Fluid Compute / Functions, the app instance is invoked directly.
if (!process.env.VERCEL) {
  server.listen(PORT, () => {
    console.log(`server listening on port ${PORT}`);
  });
}

export default app;
