import { io } from '../config/socket';
import Assignment from '../models/Assignment';
import GeneratedPaper from '../models/GeneratedPaper';
import SavedQuestion from '../models/SavedQuestion';
import { generatePaper } from '../services/aiService';

function emit(assignmentId: string, payload: Record<string, unknown>) {
  io.to(assignmentId).emit('job:update', payload);
}

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function processAssignment(assignmentId: string) {
  await Assignment.findByIdAndUpdate(assignmentId, { status: 'processing' });

  emit(assignmentId, { status: 'analyzing', message: 'Analyzing your inputs...', step: 1, totalSteps: 6 });
  await delay(800);

  emit(assignmentId, { status: 'structuring', message: 'Structuring question sections...', step: 2, totalSteps: 6 });
  await delay(600);

  emit(assignmentId, { status: 'generating_easy', message: 'Generating easy questions...', step: 3, totalSteps: 6 });

  const assignment = await Assignment.findById(assignmentId).lean();
  if (!assignment) throw new Error('Assignment not found');

  const paperData = await generatePaper({
    subject: assignment.subject,
    questionTypes: assignment.questionTypes,
    totalQuestions: assignment.totalQuestions,
    totalMarks: assignment.totalMarks,
    instructions: assignment.instructions,
  });

  emit(assignmentId, { status: 'generating_hard', message: 'Generating remaining sections...', step: 4, totalSteps: 6 });
  await delay(400);

  emit(assignmentId, { status: 'answer_key', message: 'Building answer key...', step: 5, totalSteps: 6 });

  const paper = await GeneratedPaper.create({
    assignmentId,
    ...paperData,
    metadata: { ...paperData.metadata, generatedAt: new Date(paperData.metadata.generatedAt) },
  });

  const questionsToSave = paper.sections.flatMap((section) =>
    section.questions.map((q) => {
      const ans = paper.answerKey.find((a) => a.number === q.number);
      return {
        assignmentId,
        paperId: paper._id,
        subject: assignment.subject,
        text: q.text,
        type: q.type,
        difficulty: q.difficulty,
        marks: q.marks,
        options: q.options || [],
        answer: ans?.answer || '',
      };
    })
  );
  if (questionsToSave.length > 0) await SavedQuestion.insertMany(questionsToSave);

  await Assignment.findByIdAndUpdate(assignmentId, { status: 'completed' });

  emit(assignmentId, {
    status: 'completed',
    message: 'Your paper is ready!',
    step: 6,
    totalSteps: 6,
    paperId: paper._id.toString(),
  });
}
