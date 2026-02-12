import express from 'express';
import Group from '../models/Group.js';
import Student from '../models/Student.js';
import { authMiddleware, teacherOnly } from '../middleware/auth.js';

const router = express.Router();
router.use(authMiddleware);

const toResponse = (g) => ({
  id: g._id.toString(),
  name: g.name,
  memberIds: g.memberIds.map((id) => id.toString()),
  aiNotes: g.aiNotes
});

router.get('/', async (req, res) => {
  try {
    const groups = await Group.find();
    res.json(groups.map(toResponse));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', teacherOnly, async (req, res) => {
  try {
    const { groups } = req.body; // [{ name, memberIds, aiNotes }]
    await Group.deleteMany({});
    const created = await Group.insertMany(groups);
    const groupIds = created.map((g) => g._id);

    await Student.updateMany({}, { $unset: { groupId: 1 } });
    for (const g of created) {
      await Student.updateMany(
        { _id: { $in: g.memberIds } },
        { $set: { groupId: g._id } }
      );
    }

    res.status(201).json(created.map(toResponse));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
