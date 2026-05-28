import { Router } from 'express';
import { z } from 'zod';
import Group from '../models/Group';

const router = Router();

const GroupSchema = z.object({
  name: z.string().min(1),
  grade: z.string().min(1),
  subject: z.string().min(1),
  studentCount: z.number().int().min(0).default(0),
});

router.get('/', async (_req, res) => {
  const groups = await Group.find().sort({ createdAt: -1 }).lean();
  res.json(groups);
});

router.post('/', async (req, res) => {
  const parsed = GroupSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.flatten() }); return; }
  const group = await Group.create(parsed.data);
  res.status(201).json(group);
});

router.delete('/:id', async (req, res) => {
  await Group.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
});

export default router;
