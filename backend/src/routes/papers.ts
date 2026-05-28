import { Router } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import GeneratedPaper from '../models/GeneratedPaper';
import { generatePDF } from '../services/pdfService';

const router = Router();

function getModel() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error('GEMINI_API_KEY not set');
  return new GoogleGenerativeAI(key).getGenerativeModel({ model: 'gemini-3.5-flash' });
}

router.get('/:assignmentId', async (req, res) => {
  try {
    const paper = await GeneratedPaper.findOne({ assignmentId: req.params.assignmentId }).lean();
    if (!paper) { res.status(404).json({ error: 'Paper not found' }); return; }
    res.json(paper);
  } catch {
    res.status(500).json({ error: 'Failed to fetch paper' });
  }
});

router.post('/:assignmentId/pdf', async (req, res) => {
  try {
    const paper = await GeneratedPaper.findOne({ assignmentId: req.params.assignmentId });
    if (!paper) { res.status(404).json({ error: 'Paper not found' }); return; }
    const pdf = await generatePDF(paper);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${paper.subject}_paper.pdf"`);
    res.send(pdf);
  } catch (err) {
    console.error('[PDF]', (err as Error).message);
    res.status(500).json({ error: 'PDF generation failed' });
  }
});

router.post('/:assignmentId/regenerate-section', async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const { sectionIndex, sectionType } = req.body;
    if (sectionIndex === undefined || !sectionType) {
      res.status(400).json({ error: 'sectionIndex and sectionType required' });
      return;
    }

    const paper = await GeneratedPaper.findOne({ assignmentId });
    if (!paper) { res.status(404).json({ error: 'Paper not found' }); return; }

    const section = paper.sections[sectionIndex];
    if (!section) { res.status(400).json({ error: 'Section not found' }); return; }

    const marksEach = section.questions[0]?.marks ?? 2;
    const prompt = `Regenerate this exam section with completely fresh questions.
Subject: ${paper.subject}
Section type: ${sectionType}
Number of questions: ${section.questions.length}
Marks per question: ${marksEach}
Difficulty distribution: 40% Easy, 40% Moderate, 20% Challenging
Return ONLY valid JSON (no markdown, no code fences):
{
  "title": "${section.title}",
  "type": "${section.type}",
  "instruction": "${section.instruction}",
  "questions": [
    {
      "number": 1,
      "text": "question text",
      "type": "${sectionType}",
      "difficulty": "Easy",
      "marks": ${marksEach},
      "options": []
    }
  ]
}`;

    const raw = (await getModel().generateContent(prompt)).response
      .text()
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();

    const newSection = JSON.parse(raw);
    paper.sections[sectionIndex] = newSection;
    await paper.save();

    res.json({ section: newSection });
  } catch (err) {
    console.error('[Regenerate section]', (err as Error).message);
    res.status(500).json({ error: 'Failed to regenerate section' });
  }
});

export default router;
