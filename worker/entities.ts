import { IndexedEntity } from "./core-utils";
import type { UserProfile, Publication, ResearchProject, PortfolioItem, Comment, Like, Course, StudentProject, Notification } from "@shared/types";
import { MOCK_PUBLICATIONS, MOCK_PROJECTS, MOCK_PORTFOLIO_ITEMS } from "@shared/mock-data";
import { Env } from "./core-utils";

// UserProfile ENTITY
export class UserProfileEntity extends IndexedEntity<UserProfile> {
  static readonly entityName = "user";
  static readonly indexName = "users";
  static readonly initialState: UserProfile = {
    id: "",
    username: "",
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
    courseIds: [],
    savedItemIds: [],
    socialLinks: {},
  };
  static seedData = [];

  static async get(env: Env, id: string): Promise<UserProfile | null> {
    const inst = new this(env, id);
    if (!(await inst.exists())) return null;
    return inst.getState();
  }
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
    createdAt: 0,
    visibility: 'public',
  };
  static seedData = MOCK_PUBLICATIONS;

  static async get(env: Env, id: string): Promise<Publication | null> {
    const inst = new this(env, id);
    if (!(await inst.exists())) return null;
    return inst.getState();
  }
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
    createdAt: 0,
    visibility: 'public',
  };
  static seedData = MOCK_PROJECTS;

  static async get(env: Env, id: string): Promise<ResearchProject | null> {
    const inst = new this(env, id);
    if (!(await inst.exists())) return null;
    return inst.getState();
  }
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
    createdAt: 0,
    visibility: 'public',
  };
  static seedData = MOCK_PORTFOLIO_ITEMS;

  static async get(env: Env, id: string): Promise<PortfolioItem | null> {
    const inst = new this(env, id);
    if (!(await inst.exists())) return null;
    return inst.getState();
  }
}

// Course ENTITY
export class CourseEntity extends IndexedEntity<Course> {
  static readonly entityName = "course";
  static readonly indexName = "courses";
  static readonly initialState: Course = {
    id: "",
    lecturerId: "",
    title: "",
    code: "",
    semester: "",
    year: 0,
    description: "",
    studentProjectIds: [],
    createdAt: 0,
    visibility: 'public',
  };

  static async get(env: Env, id: string): Promise<Course | null> {
    const inst = new this(env, id);
    if (!(await inst.exists())) return null;
    return inst.getState();
  }
}

// StudentProject ENTITY
export class StudentProjectEntity extends IndexedEntity<StudentProject> {
  static readonly entityName = "studentProject";
  static readonly indexName = "studentProjects";
  static readonly initialState: StudentProject = {
    id: "",
    type: 'student-project',
    courseId: "",
    lecturerId: "",
    title: "",
    students: [],
    description: "",
    thumbnailUrl: "",
    url: "",
    createdAt: 0,
    visibility: 'public',
  };

  static async get(env: Env, id: string): Promise<StudentProject | null> {
    const inst = new this(env, id);
    if (!(await inst.exists())) return null;
    return inst.getState();
  }
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
    likeIds: [],
    parentId: undefined,
    createdAt: 0,
  };

  static async get(env: Env, id: string): Promise<Comment | null> {
    const inst = new this(env, id);
    if (!(await inst.exists())) return null;
    return inst.getState();
  }
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

// Notification ENTITY
export class NotificationEntity extends IndexedEntity<Notification> {
  static readonly entityName = "notification";
  static readonly indexName = "notifications";
  static readonly initialState: Notification = {
    id: "",
    userId: "",
    type: 'system',
    actorId: "",
    actorName: "",
    resourceId: "",
    resourceType: 'publication',
    message: "",
    isRead: false,
    createdAt: 0,
  };
}