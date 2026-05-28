import 'dotenv/config';
import express from 'express';
import http from 'http';
import cors from 'cors';
import mongoose from 'mongoose';
import { initSocket } from './config/socket';
import assignmentRoutes from './routes/assignments';
import paperRoutes from './routes/papers';
import groupRoutes from './routes/groups';
import libraryRoutes from './routes/library';
import toolkitRoutes from './routes/toolkit';
import statsRoutes from './routes/stats';

const app = express();
const server = http.createServer(app);

initSocket(server);

const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:3000').split(',').map(s => s.trim());
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.some(o => origin.startsWith(o))) return cb(null, true);
    cb(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/assignments', assignmentRoutes);
app.use('/api/papers', paperRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/library', libraryRoutes);
app.use('/api/toolkit', toolkitRoutes);
app.use('/api/stats', statsRoutes);
app.get('/health', (_req, res) => res.json({ ok: true }));

mongoose
  .connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/vedaai')
  .then(() => {
    console.log('MongoDB connected');
    server.listen(process.env.PORT || 4000, () =>
      console.log(`Server on port ${process.env.PORT || 4000}`)
    );
  })
  .catch((err) => { console.error(err); process.exit(1); });
