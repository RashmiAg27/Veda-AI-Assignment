import { Router } from 'express';
import Assignment from '../models/Assignment';
import GeneratedPaper from '../models/GeneratedPaper';

const router = Router();

router.get('/', async (_req, res) => {
  try {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const sevenDaysFromNow = new Date(startOfToday);
    sevenDaysFromNow.setDate(startOfToday.getDate() + 7);

    const [totalAssignments, generatedToday, questionsResult, recentAssignments, upcomingDue] = await Promise.all([
      Assignment.countDocuments(),
      Assignment.countDocuments({ status: 'completed', createdAt: { $gte: startOfToday } }),
      GeneratedPaper.aggregate([
        {
          $project: {
            questionCount: {
              $sum: { $map: { input: '$sections', as: 's', in: { $size: '$$s.questions' } } },
            },
          },
        },
        { $group: { _id: null, total: { $sum: '$questionCount' } } },
      ]),
      Assignment.find().sort({ createdAt: -1 }).limit(5).lean(),
      Assignment.find({
        dueDate: { $gte: startOfToday, $lte: sevenDaysFromNow },
        status: 'completed',
      })
        .sort({ dueDate: 1 })
        .limit(5)
        .select('title subject dueDate _id')
        .lean(),
    ]);

    res.json({
      totalAssignments,
      generatedToday,
      totalQuestions: questionsResult[0]?.total || 0,
      recentAssignments,
      upcomingDue,
    });
  } catch {
    res.status(500).json({ error: 'Failed to load stats' });
  }
});

export default router;
