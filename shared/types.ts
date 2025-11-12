export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
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
  thumbnailUrl?: string;
}
export interface PortfolioItem {
  id: string;
  type: 'portfolio';
  lecturerId: string;
  title: string;
  category: string; // e.g., Award, Grant, Teaching, Service
  description: string;
  year: number;
  url?: string;
  thumbnailUrl?: string;
}
export type AcademicWork = Publication | ResearchProject | PortfolioItem;
export interface LecturerProfile {
  id:string;
  name: string;
  title: string; // e.g., "Professor of Computer Science"
  university: string;
  department: string;
  bio: string;
  photoUrl: string;
  email: string;
  password?: string;
  specializations: string[];
  publicationIds: string[];
  projectIds: string[];
  portfolioItemIds: string[];
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
    github?: string;
  };
}