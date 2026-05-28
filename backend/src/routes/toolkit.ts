import { Router } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';

const router = Router();

function getModel() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error('GEMINI_API_KEY is not set');
  return new GoogleGenerativeAI(key).getGenerativeModel({ model: 'gemini-3.5-flash' });
}

async function callGemini(prompt: string): Promise<string> {
  const result = await getModel().generateContent(prompt);
  return result.response
    .text()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();
}

router.post('/rubric', async (req, res) => {
  try {
    const { title, subject, totalMarks } = req.body;
    if (!title || !subject || !totalMarks) {
      res.status(400).json({ error: 'title, subject, and totalMarks are required' });
      return;
    }
    const prompt = `Generate a detailed marking rubric.
Title: ${title}
Subject: ${subject}
Total Marks: ${totalMarks}
Return ONLY valid JSON (no markdown):
{
  "criteria": [
    {
      "name": "string",
      "description": "string",
      "maxMarks": 10,
      "levels": [
        { "label": "Excellent", "marks": 10, "description": "string" },
        { "label": "Good", "marks": 7, "description": "string" },
        { "label": "Satisfactory", "marks": 5, "description": "string" },
        { "label": "Needs Improvement", "marks": 2, "description": "string" }
      ]
    }
  ]
}`;
    res.json(JSON.parse(await callGemini(prompt)));
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

router.post('/analyze', async (req, res) => {
  try {
    const { question } = req.body;
    if (!question) { res.status(400).json({ error: 'question is required' }); return; }
    const prompt = `Analyze this exam question. Return ONLY valid JSON (no markdown):
Question: ${question}
{
  "difficulty": "Easy",
  "score": 3,
  "reasoning": "string",
  "cognitive_level": "Remember",
  "suggestions": ["string"]
}
difficulty: Easy | Moderate | Challenging
cognitive_level: Remember | Understand | Apply | Analyze | Evaluate | Create`;
    res.json(JSON.parse(await callGemini(prompt)));
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

router.post('/variants', async (req, res) => {
  try {
    const { question, subject } = req.body;
    if (!question || !subject) { res.status(400).json({ error: 'question and subject are required' }); return; }
    const prompt = `Generate 3 variants of this question at different difficulty levels.
Original: ${question}
Subject: ${subject}
Return ONLY valid JSON (no markdown):
{
  "original": "string",
  "variants": [
    { "difficulty": "Easy", "question": "string", "explanation": "string" },
    { "difficulty": "Moderate", "question": "string", "explanation": "string" },
    { "difficulty": "Challenging", "question": "string", "explanation": "string" }
  ]
}`;
    res.json(JSON.parse(await callGemini(prompt)));
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

export default router;
