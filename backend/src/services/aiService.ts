import { GoogleGenerativeAI } from '@google/generative-ai';
import { IQuestionType } from '../models/Assignment';

// Initialized lazily so dotenv has loaded by the time this is called
function getGenAI() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error('GEMINI_API_KEY is not set in .env');
  return new GoogleGenerativeAI(key);
}

interface GeneratedPaperData {
  schoolName: string;
  subject: string;
  className: string;
  timeAllowed: string;
  sections: Array<{
    title: string;
    type: string;
    instruction: string;
    questions: Array<{
      number: number;
      text: string;
      type: string;
      difficulty: 'Easy' | 'Moderate' | 'Challenging';
      marks: number;
      options: string[];
    }>;
  }>;
  answerKey: Array<{ number: number; answer: string }>;
  metadata: {
    subject: string;
    totalMarks: number;
    totalQuestions: number;
    generatedAt: string;
  };
}

function calculateTimeAllowed(totalMarks: number): string {
  const minutes = Math.round(totalMarks * 3);
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    const rem = minutes % 60;
    return rem > 0
      ? `${hours} hour${hours > 1 ? 's' : ''} ${rem} minutes`
      : `${hours} hour${hours > 1 ? 's' : ''}`;
  }
  return `${minutes} minutes`;
}

export async function generatePaper(params: {
  subject: string;
  className?: string;
  questionTypes: IQuestionType[];
  totalQuestions: number;
  totalMarks: number;
  instructions?: string;
  fileContent?: string;
}): Promise<GeneratedPaperData> {
  const timeAllowed = calculateTimeAllowed(params.totalMarks);
  const qtLines = params.questionTypes
    .map((qt) => `- ${qt.label}: ${qt.count} questions × ${qt.marksPerQuestion} marks each`)
    .join('\n');

  const prompt = `You are an expert exam paper generator for Indian schools. Return ONLY valid JSON with no markdown, no explanation, no code fences.

Generate a question paper for an Indian school exam:
Subject: ${params.subject}
School: Delhi Public School, Sector-4, Bokaro
Class/Grade: ${params.className || '8th'}
Question Types:
${qtLines}
Total Questions: ${params.totalQuestions}
Total Marks: ${params.totalMarks}
Time Allowed: ${timeAllowed}
Additional Instructions: ${params.instructions || 'None'}
${params.fileContent ? `Reference Material:\n${params.fileContent}` : ''}

Organize into sections by question type. Distribute difficulty: 40% Easy, 40% Moderate, 20% Challenging per section.
Generate a complete answer key.

CRITICAL MARKS RULES — you MUST follow exactly:
${params.questionTypes.map((qt, i) => `- Section ${String.fromCharCode(65 + i)} (${qt.label}): every single question MUST have "marks": ${qt.marksPerQuestion}`).join('\n')}
Do NOT use any other marks value. Every question's "marks" field must exactly match the value above for its section.

Return ONLY this JSON (no markdown, no code fences):
{
  "schoolName": "Delhi Public School, Sector-4, Bokaro",
  "subject": "${params.subject}",
  "className": "${params.className || '8th'}",
  "timeAllowed": "${timeAllowed}",
  "sections": [
    ${params.questionTypes.map((qt, i) => `{
      "title": "Section ${String.fromCharCode(65 + i)}",
      "type": "${qt.type}",
      "instruction": "Attempt all questions. Each question carries ${qt.marksPerQuestion} mark${qt.marksPerQuestion !== 1 ? 's' : ''}",
      "questions": [
        {
          "number": 1,
          "text": "full question text here",
          "type": "${qt.type}",
          "difficulty": "Easy",
          "marks": ${qt.marksPerQuestion},
          "options": ${qt.type === 'mcq' ? '["option a", "option b", "option c", "option d"]' : '[]'}
        }
      ]
    }`).join(',\n    ')}
  ],
  "answerKey": [
    { "number": 1, "answer": "Complete answer here" }
  ],
  "metadata": {
    "subject": "${params.subject}",
    "totalMarks": ${params.totalMarks},
    "totalQuestions": ${params.totalQuestions},
    "generatedAt": "${new Date().toISOString()}"
  }
}`;

  const model = getGenAI().getGenerativeModel({ model: 'gemini-3.5-flash' });
  const result = await model.generateContent(prompt);
  const rawText = result.response.text();

  // Strip any accidental markdown fences
  const cleaned = rawText
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  const data: GeneratedPaperData = JSON.parse(cleaned);

  if (!data.sections || data.sections.length === 0) {
    throw new Error('Gemini returned empty sections');
  }

  return data;
}
