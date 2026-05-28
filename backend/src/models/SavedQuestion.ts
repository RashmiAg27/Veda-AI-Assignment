import mongoose, { Document, Schema } from 'mongoose';

export interface ISavedQuestion extends Document {
  assignmentId: mongoose.Types.ObjectId;
  paperId: mongoose.Types.ObjectId;
  subject: string;
  text: string;
  type: string;
  difficulty: 'Easy' | 'Moderate' | 'Challenging';
  marks: number;
  options: string[];
  answer: string;
  createdAt: Date;
}

const SavedQuestionSchema = new Schema<ISavedQuestion>(
  {
    assignmentId: { type: Schema.Types.ObjectId, ref: 'Assignment', required: true },
    paperId: { type: Schema.Types.ObjectId, ref: 'GeneratedPaper', required: true },
    subject: { type: String, required: true },
    text: { type: String, required: true },
    type: { type: String, required: true },
    difficulty: { type: String, enum: ['Easy', 'Moderate', 'Challenging'], required: true },
    marks: { type: Number, required: true },
    options: { type: [String], default: [] },
    answer: { type: String, default: '' },
  },
  { timestamps: true }
);

export default mongoose.model<ISavedQuestion>('SavedQuestion', SavedQuestionSchema);
