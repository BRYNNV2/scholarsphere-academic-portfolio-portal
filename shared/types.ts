export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
export type AcademicWork = Publication | ResearchProject;
export interface Publication {
  id: string;
  type: 'publication';
  lecturerId: string;
  title: string;
  authors: string[];
  journal: string;
  year: number;
  url?: string;
}
export interface ResearchProject {
  id: string;
  type: 'project';
  lecturerId: string;
  title: string;
  description: string;
  role: string;
  year: number;
  url?: string;
}
export interface LecturerProfile {
  id:string;
  name: string;
  title: string; // e.g., "Professor of Computer Science"
  university: string;
  department: string;
  bio: string;
  photoUrl: string;
  email: string;
  specializations: string[];
  publicationIds: string[];
  projectIds: string[];
}