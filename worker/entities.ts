import { IndexedEntity } from "./core-utils";
import type { UserProfile, Publication, ResearchProject, PortfolioItem, Comment, Like } from "@shared/types";
import { MOCK_PUBLICATIONS, MOCK_PROJECTS, MOCK_PORTFOLIO_ITEMS } from "@shared/mock-data";
// UserProfile ENTITY
export class UserProfileEntity extends IndexedEntity<UserProfile> {
  static readonly entityName = "user";
  static readonly indexName = "users";
  static readonly initialState: UserProfile = {
    id: "",
    name: "",
    role: 'lecturer',
    title: "",
    university: "",
    department: "",
    bio: "",
    photoUrl: "",
    email: "",
    password: "",
    specializations: [],
    publicationIds: [],
    projectIds: [],
    portfolioItemIds: [],
    savedItemIds: [],
    socialLinks: {},
  };
  static seedData = [];
}
// Publication ENTITY
export class PublicationEntity extends IndexedEntity<Publication> {
  static readonly entityName = "publication";
  static readonly indexName = "publications";
  static readonly initialState: Publication = {
    id: "",
    type: 'publication',
    lecturerId: '',
    title: "",
    authors: [],
    journal: "",
    year: 0,
    url: "",
    thumbnailUrl: "",
    commentIds: [],
    likeIds: [],
  };
  static seedData = MOCK_PUBLICATIONS;
}
// ResearchProject ENTITY
export class ResearchProjectEntity extends IndexedEntity<ResearchProject> {
  static readonly entityName = "project";
  static readonly indexName = "projects";
  static readonly initialState: ResearchProject = {
    id: "",
    type: 'project',
    lecturerId: '',
    title: "",
    description: "",
    role: "",
    year: 0,
    thumbnailUrl: "",
    commentIds: [],
    likeIds: [],
  };
  static seedData = MOCK_PROJECTS;
}
// PortfolioItem ENTITY
export class PortfolioItemEntity extends IndexedEntity<PortfolioItem> {
  static readonly entityName = "portfolio";
  static readonly indexName = "portfolioItems";
  static readonly initialState: PortfolioItem = {
    id: "",
    type: 'portfolio',
    lecturerId: '',
    title: "",
    category: "",
    description: "",
    year: 0,
    thumbnailUrl: "",
    commentIds: [],
    likeIds: [],
  };
  static seedData = MOCK_PORTFOLIO_ITEMS;
}
// Comment ENTITY
export class CommentEntity extends IndexedEntity<Comment> {
  static readonly entityName = "comment";
  static readonly indexName = "comments";
  static readonly initialState: Comment = {
    id: "",
    postId: "",
    userId: "",
    userName: "",
    userPhotoUrl: "",
    content: "",
    createdAt: 0,
  };
}
// Like ENTITY
export class LikeEntity extends IndexedEntity<Like> {
  static readonly entityName = "like";
  static readonly indexName = "likes";
  static readonly initialState: Like = {
    id: "",
    postId: "",
    userId: "",
  };
}