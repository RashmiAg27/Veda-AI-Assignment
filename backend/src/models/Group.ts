import mongoose, { Document, Schema } from 'mongoose';

export interface IGroup extends Document {
  name: string;
  grade: string;
  subject: string;
  studentCount: number;
  createdAt: Date;
}

const GroupSchema = new Schema<IGroup>(
  {
    name: { type: String, required: true },
    grade: { type: String, required: true },
    subject: { type: String, required: true },
    studentCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model<IGroup>('Group', GroupSchema);
