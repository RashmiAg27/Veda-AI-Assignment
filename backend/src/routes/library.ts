import { Router } from 'express';
import SavedQuestion from '../models/SavedQuestion';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const { subject, difficulty, type, search, page = '1' } = req.query;
    const filter: Record<string, unknown> = {};

    if (subject) filter.subject = subject;
    if (difficulty) filter.difficulty = difficulty;
    if (type) filter.type = type;
    if (search) filter.text = { $regex: search as string, $options: 'i' };

    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const limit = 20;
    const skip = (pageNum - 1) * limit;

    const [questions, total] = await Promise.all([
      SavedQuestion.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      SavedQuestion.countDocuments(filter),
    ]);

    res.json({ questions, total, page: pageNum, totalPages: Math.ceil(total / limit) });
  } catch {
    res.status(500).json({ error: 'Failed to load library' });
  }
});

router.delete('/:id', async (req, res) => {
  await SavedQuestion.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
});

export default router;
