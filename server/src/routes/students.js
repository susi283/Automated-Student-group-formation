import express from 'express';
import bcrypt from 'bcrypt';
import Student from '../models/Student.js';
import User from '../models/User.js';
import { authMiddleware, teacherOnly } from '../middleware/auth.js';

const router = express.Router();
router.use(authMiddleware);

const toResponse = (s) => ({
  id: s._id.toString(),
  userId: s.userId?.toString(),
  name: s.name,
  email: s.email,
  cgpa: s.cgpa,
  skills: s.skills || [],
  department: s.department || '',
  year: s.year || '',
  groupId: s.groupId?.toString()
});

router.get('/', async (req, res) => {
  try {
    const students = await Student.find();
    res.json(students.map(toResponse));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', teacherOnly, async (req, res) => {
  try {
    const data = req.body;
    const existing = await User.findOne({ email: data.email });
    if (existing) {
      const student = await Student.findOne({ email: data.email });
      if (student) return res.status(400).json({ error: 'Student with this email already exists.' });
    }

    const passwordHash = await bcrypt.hash(data.password || 'password123', 12);
    const user = existing || await User.create({
      email: data.email,
      name: data.name,
      role: 'STUDENT',
      passwordHash
    });

    const student = await Student.create({
      userId: user._id,
      name: data.name,
      email: data.email,
      cgpa: Number(data.cgpa) || 0,
      skills: Array.isArray(data.skills) ? data.skills : [],
      department: data.department || '',
      year: data.year || ''
    });

    res.status(201).json(toResponse(student));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', teacherOnly, async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ error: 'Student not found.' });

    const { password, ...rest } = req.body;
    Object.assign(student, rest);

    if (password) {
      const user = await User.findById(student.userId);
      if (user) {
        user.passwordHash = await bcrypt.hash(password, 12);
        await user.save();
      }
    }

    await student.save();
    res.json(toResponse(student));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', teacherOnly, async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ error: 'Student not found.' });
    await User.findByIdAndDelete(student.userId);
    await Student.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
