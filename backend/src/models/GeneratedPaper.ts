import mongoose, { Document, Schema } from 'mongoose';

export interface IQuestion {
  number: number;
  text: string;
  type: string;
  difficulty: 'Easy' | 'Moderate' | 'Challenging';
  marks: number;
  options: string[];
}

export interface IPaperSection {
  title: string;
  type: string;
  instruction: string;
  questions: IQuestion[];
}

export interface IAnswerKeyItem {
  number: number;
  answer: string;
}

export interface IGeneratedPaper extends Document {
  assignmentId: mongoose.Types.ObjectId;
  schoolName: string;
  subject: string;
  className: string;
  timeAllowed: string;
  sections: IPaperSection[];
  answerKey: IAnswerKeyItem[];
  metadata: {
    subject: string;
    totalMarks: number;
    totalQuestions: number;
    generatedAt: Date;
  };
}

const QuestionSchema = new Schema<IQuestion>({
  number: { type: Number, required: true },
  text: { type: String, required: true },
  type: { type: String, required: true },
  difficulty: { type: String, enum: ['Easy', 'Moderate', 'Challenging'], required: true },
  marks: { type: Number, required: true },
  options: { type: [String], default: [] },
});

const SectionSchema = new Schema<IPaperSection>({
  title: { type: String, required: true },
  type: { type: String, required: true },
  instruction: { type: String, required: true },
  questions: { type: [QuestionSchema], required: true },
});

const AnswerKeySchema = new Schema<IAnswerKeyItem>({
  number: { type: Number, required: true },
  answer: { type: String, required: true },
});

const GeneratedPaperSchema = new Schema<IGeneratedPaper>(
  {
    assignmentId: { type: Schema.Types.ObjectId, ref: 'Assignment', required: true },
    schoolName: { type: String, required: true },
    subject: { type: String, required: true },
    className: { type: String, required: true },
    timeAllowed: { type: String, required: true },
    sections: { type: [SectionSchema], required: true },
    answerKey: { type: [AnswerKeySchema], required: true },
    metadata: {
      subject: { type: String, required: true },
      totalMarks: { type: Number, required: true },
      totalQuestions: { type: Number, required: true },
      generatedAt: { type: Date, required: true },
    },
  },
  { timestamps: true }
);

export default mongoose.model<IGeneratedPaper>('GeneratedPaper', GeneratedPaperSchema);
