import { Assignment, GeneratedPaper, Group, SavedQuestion, Stats } from '@/types';

const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error || `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

// Assignments
export async function createAssignment(formData: FormData) {
  return handle<{ assignmentId: string; status: string }>(
    await fetch(`${BASE}/api/assignments`, { method: 'POST', body: formData })
  );
}
export async function getAssignments() {
  return handle<Assignment[]>(await fetch(`${BASE}/api/assignments`));
}
export async function deleteAssignment(id: string) {
  return handle<void>(await fetch(`${BASE}/api/assignments/${id}`, { method: 'DELETE' }));
}

// Papers
export async function getPaper(assignmentId: string) {
  return handle<GeneratedPaper>(await fetch(`${BASE}/api/papers/${assignmentId}`));
}
export async function downloadPDF(assignmentId: string) {
  const res = await fetch(`${BASE}/api/papers/${assignmentId}/pdf`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to generate PDF');
  return res.blob();
}
export async function regenerateSection(assignmentId: string, sectionIndex: number, sectionType: string) {
  return handle<{ section: GeneratedPaper['sections'][0] }>(
    await fetch(`${BASE}/api/papers/${assignmentId}/regenerate-section`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sectionIndex, sectionType }),
    })
  );
}

// Stats
export async function getStats() {
  return handle<Stats>(await fetch(`${BASE}/api/stats`));
}

// Groups
export async function getGroups() {
  return handle<Group[]>(await fetch(`${BASE}/api/groups`));
}
export async function createGroup(data: { name: string; grade: string; subject: string; studentCount: number }) {
  return handle<Group>(
    await fetch(`${BASE}/api/groups`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
  );
}
export async function deleteGroup(id: string) {
  return handle<void>(await fetch(`${BASE}/api/groups/${id}`, { method: 'DELETE' }));
}

// Library
export async function getLibrary(params: { subject?: string; difficulty?: string; type?: string; search?: string; page?: number }) {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => { if (v !== undefined && v !== '') q.set(k, String(v)); });
  return handle<{ questions: SavedQuestion[]; total: number; page: number; totalPages: number }>(
    await fetch(`${BASE}/api/library?${q}`)
  );
}
export async function deleteQuestion(id: string) {
  return handle<void>(await fetch(`${BASE}/api/library/${id}`, { method: 'DELETE' }));
}

// Toolkit
export async function generateRubric(data: { title: string; subject: string; totalMarks: number }) {
  return handle<{ criteria: Array<{ name: string; description: string; maxMarks: number; levels: Array<{ label: string; marks: number; description: string }> }> }>(
    await fetch(`${BASE}/api/toolkit/rubric`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
  );
}
export async function analyzeQuestion(question: string) {
  return handle<{ difficulty: string; score: number; reasoning: string; cognitive_level: string; suggestions: string[] }>(
    await fetch(`${BASE}/api/toolkit/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question }),
    })
  );
}
export async function generateVariants(data: { question: string; subject: string }) {
  return handle<{ original: string; variants: Array<{ difficulty: string; question: string; explanation: string }> }>(
    await fetch(`${BASE}/api/toolkit/variants`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
  );
}
