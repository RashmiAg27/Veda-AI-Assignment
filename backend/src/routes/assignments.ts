import { Router } from 'express';
import multer from 'multer';
import { z } from 'zod';
import Assignment from '../models/Assignment';
import GeneratedPaper from '../models/GeneratedPaper';
import { processAssignment } from '../workers/paperWorker';
import { io } from '../config/socket';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

const CreateSchema = z.object({
  subject: z.string().min(1),
  instructions: z.string().optional().default(''),
  dueDate: z.string().min(1),
  questionTypes: z.array(z.object({
    type: z.string(),
    label: z.string(),
    count: z.number().int().positive(),
    marksPerQuestion: z.number().int().positive(),
  })).min(1),
});

router.get('/', async (_req, res) => {
  const list = await Assignment.find().sort({ createdAt: -1 }).lean();
  res.json(list);
});

router.get('/:id', async (req, res) => {
  const doc = await Assignment.findById(req.params.id).lean();
  if (!doc) { res.status(404).json({ error: 'Not found' }); return; }
  res.json(doc);
});

router.post('/', upload.single('file'), async (req, res) => {
  try {
    const body = {
      subject: req.body.subject,
      instructions: req.body.instructions || '',
      dueDate: req.body.dueDate,
      timeAllowed: req.body.timeAllowed || '',
      questionTypes: typeof req.body.questionTypes === 'string'
        ? JSON.parse(req.body.questionTypes)
        : req.body.questionTypes,
    };

    const parsed = CreateSchema.safeParse(body);
    if (!parsed.success) { res.status(400).json({ error: parsed.error.flatten() }); return; }

    const { subject, instructions, dueDate, questionTypes } = parsed.data;
    const totalQuestions = questionTypes.reduce((s, q) => s + q.count, 0);
    const totalMarks = questionTypes.reduce((s, q) => s + q.count * q.marksPerQuestion, 0);

    const assignment = await Assignment.create({
      title: `${subject} Quiz`,
      subject, instructions,
      dueDate: new Date(dueDate),
      questionTypes, totalQuestions, totalMarks,
      status: 'pending',
    });

    const assignmentId = assignment._id.toString();

    // Process inline — delay allows frontend socket to join the room first
    setTimeout(() => processAssignment(assignmentId).catch(async (err) => {
      console.error('[Worker] failed:', err.message);
      await Assignment.findByIdAndUpdate(assignmentId, { status: 'failed' });
      io.to(assignmentId).emit('job:update', { status: 'failed', message: err.message || 'Generation failed' });
    }), 1500);

    res.status(201).json({ assignmentId, status: 'pending' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/:id', async (req, res) => {
  await Assignment.findByIdAndDelete(req.params.id);
  await GeneratedPaper.deleteMany({ assignmentId: req.params.id });
  res.json({ ok: true });
});

export default router;
