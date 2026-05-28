export interface QuestionTypeRow {
  id: string;
  label: string;
  type: string;
  count: number;
  marksPerQuestion: number;
}

export interface AssignmentFormData {
  subject: string;
  className: string;
  dueDate: string;
  questionTypes: QuestionTypeRow[];
  instructions: string;
  file?: File;
}

export interface Question {
  number: number;
  text: string;
  type: string;
  difficulty: 'Easy' | 'Moderate' | 'Challenging';
  marks: number;
  options?: string[];
}

export interface PaperSection {
  title: string;
  type: string;
  instruction: string;
  questions: Question[];
}

export interface AnswerKeyItem {
  number: number;
  answer: string;
}

export interface GeneratedPaper {
  _id: string;
  assignmentId: string;
  schoolName: string;
  subject: string;
  className: string;
  timeAllowed: string;
  sections: PaperSection[];
  answerKey: AnswerKeyItem[];
  metadata: {
    subject: string;
    totalMarks: number;
    totalQuestions: number;
    generatedAt: string;
  };
}

export interface Assignment {
  _id: string;
  title: string;
  subject: string;
  dueDate: string;
  createdAt: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  totalQuestions: number;
  totalMarks: number;
}

export type JobStatus = 'idle' | 'pending' | 'processing' | 'completed' | 'failed';

export interface Group {
  _id: string;
  name: string;
  grade: string;
  subject: string;
  studentCount: number;
  createdAt: string;
}

export interface SavedQuestion {
  _id: string;
  assignmentId: string;
  paperId: string;
  subject: string;
  text: string;
  type: string;
  difficulty: 'Easy' | 'Moderate' | 'Challenging';
  marks: number;
  options: string[];
  answer: string;
  createdAt: string;
}

export interface UpcomingAssignment {
  _id: string;
  title: string;
  subject: string;
  dueDate: string;
}

export interface Stats {
  totalAssignments: number;
  generatedToday: number;
  totalQuestions: number;
  recentAssignments: Assignment[];
  upcomingDue: UpcomingAssignment[];
}
