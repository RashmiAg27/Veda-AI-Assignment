import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { AssignmentFormData, Assignment, GeneratedPaper, JobStatus, QuestionTypeRow } from '@/types';

const defaultFormData: AssignmentFormData = {
  subject: '',
  className: '',
  dueDate: '',
  questionTypes: [],
  instructions: '',
};

interface AssignmentStore {
  formData: AssignmentFormData;
  assignmentId: string | null;
  jobStatus: JobStatus;
  statusMessage: string;
  currentStep: number;
  totalSteps: number;
  paper: GeneratedPaper | null;
  assignments: Assignment[];

  setFormData: (data: Partial<AssignmentFormData>) => void;
  addQuestionType: (row: QuestionTypeRow) => void;
  removeQuestionType: (id: string) => void;
  updateQuestionType: (id: string, field: keyof QuestionTypeRow, value: string | number) => void;
  setAssignmentId: (id: string) => void;
  setJobStatus: (status: JobStatus) => void;
  setPaper: (paper: GeneratedPaper) => void;
  setStatusMessage: (msg: string) => void;
  setCurrentStep: (step: number) => void;
  setAssignments: (list: Assignment[]) => void;
  reset: () => void;
}

export const useAssignmentStore = create<AssignmentStore>()(
  persist(
    (set) => ({
      formData: defaultFormData,
      assignmentId: null,
      jobStatus: 'idle',
      statusMessage: '',
      currentStep: 0,
      totalSteps: 6,
      paper: null,
      assignments: [],

      setFormData: (data) =>
        set((state) => ({ formData: { ...state.formData, ...data } })),

      addQuestionType: (row) =>
        set((state) => ({
          formData: { ...state.formData, questionTypes: [...state.formData.questionTypes, row] },
        })),

      removeQuestionType: (id) =>
        set((state) => ({
          formData: {
            ...state.formData,
            questionTypes: state.formData.questionTypes.filter((qt) => qt.id !== id),
          },
        })),

      updateQuestionType: (id, field, value) =>
        set((state) => ({
          formData: {
            ...state.formData,
            questionTypes: state.formData.questionTypes.map((qt) =>
              qt.id === id ? { ...qt, [field]: value } : qt
            ),
          },
        })),

      setAssignmentId: (id) => set({ assignmentId: id }),
      setJobStatus: (status) => set({ jobStatus: status }),
      setPaper: (paper) => set({ paper }),
      setStatusMessage: (msg) => set({ statusMessage: msg }),
      setCurrentStep: (step) => set({ currentStep: step }),
      setAssignments: (list) => set({ assignments: list }),

      reset: () =>
        set({
          formData: defaultFormData,
          assignmentId: null,
          jobStatus: 'idle',
          statusMessage: '',
          currentStep: 0,
          paper: null,
        }),
    }),
    {
      name: 'assignment-form',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({ formData: state.formData }),
    }
  )
);
