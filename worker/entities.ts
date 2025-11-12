import { IndexedEntity } from "./core-utils";
import type { LecturerProfile, Publication, ResearchProject, PortfolioItem } from "@shared/types";
import { MOCK_LECTURERS, MOCK_PUBLICATIONS, MOCK_PROJECTS, MOCK_PORTFOLIO_ITEMS } from "@shared/mock-data";
// LecturerProfile ENTITY
export class LecturerProfileEntity extends IndexedEntity<LecturerProfile> {
  static readonly entityName = "lecturer";
  static readonly indexName = "lecturers";
  static readonly initialState: LecturerProfile = {
    id: "",
    name: "",
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
  };
  static seedData = MOCK_PORTFOLIO_ITEMS;
}