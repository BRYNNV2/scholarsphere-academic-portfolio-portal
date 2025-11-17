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
  thumbnailUrl?: string;
  commentIds: string[];
  likeIds: string[];
  createdAt: number;
}
export interface ResearchProject {
  id: string;
  type: 'project' | 'research';
  lecturerId: string;
  title: string;
  description: string;
  role: string;
  year: number;
  url?: string;
  thumbnailUrl?: string;
  commentIds: string[];
  likeIds: string[];
  createdAt: number;
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
  commentIds: string[];
  likeIds: string[];
  createdAt: number;
}
export type AcademicWork = Publication | ResearchProject | PortfolioItem;
export type SavedItem = AcademicWork & { authorName: string };
export interface UserProfile {
  id:string;
  name: string;
  role: 'lecturer' | 'student';
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
  savedItemIds: string[];
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
    github?: string;
  };
}
export interface Comment {
  id: string;
  postId: string; // ID of the Publication, ResearchProject, or PortfolioItem
  userId: string;
  userName: string;
  userPhotoUrl: string;
  content: string;
  createdAt: number; // timestamp
}
export interface Like {
  id: string;
  postId: string;
  userId: string;
}
export interface WorkAnalytics {
  id: string;
  title: string;
  type: AcademicWork['type'];
  likes: number;
  saves: number;
}
export interface AnalyticsData {
  totalLikes: number;
  totalSaves: number;
  workBreakdown: WorkAnalytics[];
}