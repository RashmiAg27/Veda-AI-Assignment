import mongoose, { Document, Schema } from 'mongoose';

export interface IQuestionType {
  type: string;
  label: string;
  count: number;
  marksPerQuestion: number;
}

export interface IAssignment extends Document {
  title: string;
  subject: string;
  className: string;
  instructions: string;
  dueDate: Date;
  questionTypes: IQuestionType[];
  totalQuestions: number;
  totalMarks: number;
  difficulty: string;
  fileContent: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  jobId: string;
  createdAt: Date;
}

const QuestionTypeSchema = new Schema<IQuestionType>({
  type: { type: String, required: true },
  label: { type: String, required: true },
  count: { type: Number, required: true },
  marksPerQuestion: { type: Number, required: true },
});

const AssignmentSchema = new Schema<IAssignment>(
  {
    title: { type: String, required: true },
    subject: { type: String, required: true },
    className: { type: String, required: true },
    instructions: { type: String, default: '' },
    dueDate: { type: Date, required: true },
    questionTypes: { type: [QuestionTypeSchema], required: true },
    totalQuestions: { type: Number, required: true },
    totalMarks: { type: Number, required: true },
    difficulty: { type: String, default: 'mixed' },
    fileContent: { type: String, default: '' },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending',
    },
    jobId: { type: String, default: '' },
  },
  { timestamps: true }
);

export default mongoose.model<IAssignment>('Assignment', AssignmentSchema);
