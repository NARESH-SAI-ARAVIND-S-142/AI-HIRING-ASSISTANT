import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import { connectDB } from './db/client.js';
import evaluateRoute from './routes/evaluate.js';
import candidatesRoute from './routes/candidates.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load main .env mapping from parent dir if needed
dotenv.config({ path: path.join(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/evaluate', evaluateRoute);
app.use('/api/candidates', candidatesRoute);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'backend' });
});

// Start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Backend server running on http://localhost:${PORT}`);
  });
});
