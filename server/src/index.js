import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { connectDb } from './config/db.js';
import User from './models/User.js';
import bcrypt from 'bcrypt';
import authRoutes from './routes/auth.js';
import studentRoutes from './routes/students.js';
import groupRoutes from './routes/groups.js';
import aiRoutes from './routes/ai.js';
import { authMiddleware } from './middleware/auth.js';

await connectDb();

// Seed default teacher if none exists
const teacherCount = await User.countDocuments({ role: 'TEACHER' });
if (teacherCount === 0) {
  const hash = await bcrypt.hash('hitman123', 12);
  await User.create({
    email: 'hitman@gmail.com',
    name: 'Dr. Admin',
    role: 'TEACHER',
    passwordHash: hash
  });
  console.log('Default teacher created: hitman@gmail.com / hitman123');
}

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

app.use(cors({ origin: CLIENT_URL, credentials: true }));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/students', authMiddleware, studentRoutes);
app.use('/api/groups', authMiddleware, groupRoutes);
app.use('/api/ai', authMiddleware, aiRoutes);

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
