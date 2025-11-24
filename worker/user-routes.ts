import { Hono } from "hono";
import { jwt, sign } from 'hono/jwt'
import type { Env } from './core-utils';
import { UserProfileEntity, PublicationEntity, ResearchProjectEntity, PortfolioItemEntity, CommentEntity, LikeEntity, CourseEntity, StudentProjectEntity } from "./entities";
import { ok, bad, notFound } from './core-utils';
import type { UserProfile, Publication, ResearchProject, PortfolioItem, Comment, Like, AnalyticsData, WorkAnalytics, AcademicWork, Course, StudentProject } from "@shared/types";

type PublicationCreatePayload = Omit<Publication, 'id' | 'type' | 'lecturerId'> & { lecturerId: string };
type ProjectCreatePayload = Omit<ResearchProject, 'id' | 'type' | 'lecturerId'> & { lecturerId: string };
type PortfolioItemCreatePayload = Omit<PortfolioItem, 'id' | 'type' | 'lecturerId'> & { lecturerId: string };
type CourseCreatePayload = Omit<Course, 'id' | 'lecturerId' | 'studentProjectIds' | 'createdAt'> & { lecturerId: string };
type StudentProjectCreatePayload = Omit<StudentProject, 'id' | 'lecturerId' | 'createdAt'> & { lecturerId: string };

export function userRoutes(app: Hono<{ Bindings: Env }>) {
  // --- AUTH ---
  const auth = new Hono<{ Bindings: Env }>();

  auth.post('/register', async (c) => {
    const body = await c.req.json<Partial<UserProfile>>();
    if (!body.email || !body.password || !body.role) {
      return bad(c, 'Email, password, and role are required');
    }

    const users = (await UserProfileEntity.list(c.env)).items;
    const existingUser = users.find(l => l.email === body.email);
    if (existingUser) {
      return bad(c, 'User with this email already exists');
    }

    const newUser: UserProfile = {
      id: crypto.randomUUID(),
      name: body.name || '',
      email: body.email,
      password: body.password,
      role: body.role,
      title: body.title || '',
      university: body.university || '',
      department: body.department || '',
      bio: body.bio || '',
      publicationIds: [],
      projectIds: [],
      portfolioItemIds: [],
      courseIds: [],
      savedItemIds: [],
      specializations: body.specializations || [],
      socialLinks: body.socialLinks || {},
      photoUrl: body.photoUrl || `https://i.pravatar.cc/300?u=${body.email}`,
    };

    await UserProfileEntity.create(c.env, newUser);
    const { password, ...userToReturn } = newUser;
    const secret = c.env.JWT_SECRET || 'dev-fallback-secret';
    const token = await sign({ sub: userToReturn.id, role: userToReturn.role }, secret);
    return ok(c, { user: userToReturn, token });
  });

  auth.post('/login', async (c) => {
    const { email, password } = await c.req.json();
    if (!email || !password) {
      return bad(c, 'Email and password are required');
    }

    const users = (await UserProfileEntity.list(c.env)).items;
    const user = users.find(l => l.email === email);
    if (!user || user.password !== password) {
      return bad(c, 'Invalid credentials');
    }

    const { password: _, ...userToReturn } = user;
    const secret = c.env.JWT_SECRET || 'dev-fallback-secret';
    const token = await sign({ sub: userToReturn.id, role: userToReturn.role }, secret);
    return ok(c, { user: userToReturn, token });
  });

  app.route('/api/auth', auth);

  // --- SECURED ROUTES ---
  const authMiddleware = async (c: any, next: any) => {
    const secret = c.env.JWT_SECRET || 'dev-fallback-secret';
    const jwtMiddleware = jwt({ secret });
    return jwtMiddleware(c, next);
  };

  app.get('/api/users/me/analytics', authMiddleware, async (c) => {
    const payload = c.get('jwtPayload');
    const userId = payload.sub;
    if (!userId || payload.role !== 'lecturer') {
      return c.json({ success: false, error: 'Unauthorized' }, 403);
    }

    const lecturer = await new UserProfileEntity(c.env, userId).getState();
    const lecturerWorkIds = new Set([
      ...(lecturer.publicationIds || []),
      ...(lecturer.projectIds || []),
      ...(lecturer.portfolioItemIds || []),
    ]);

    if (lecturerWorkIds.size === 0) {
      return ok(c, { totalLikes: 0, totalSaves: 0, workBreakdown: [] });
    }

    const [allLikes, allUsersPage] = await Promise.all([
      LikeEntity.list(c.env),
      UserProfileEntity.list(c.env),
    ]);

    const allStudentProfiles = allUsersPage.items.filter(u => u.role === 'student');
    let totalSaves = 0;
    const savesPerPost = new Map<string, number>();

    for (const student of allStudentProfiles) {
      for (const savedId of student.savedItemIds || []) {
        if (lecturerWorkIds.has(savedId)) {
          totalSaves++;
          savesPerPost.set(savedId, (savesPerPost.get(savedId) || 0) + 1);
        }
      }
    }

    const likesPerPost = new Map<string, number>();
    for (const like of allLikes.items) {
      if (lecturerWorkIds.has(like.postId)) {
        likesPerPost.set(like.postId, (likesPerPost.get(like.postId) || 0) + 1);
      }
    }

    const totalLikes = allLikes.items.filter(like => lecturerWorkIds.has(like.postId)).length;

    const [allPublications, allProjects, allPortfolioItems] = await Promise.all([
      PublicationEntity.list(c.env),
      ResearchProjectEntity.list(c.env),
      PortfolioItemEntity.list(c.env),
    ]);

    const allWork = [
      ...allPublications.items,
      ...allProjects.items,
      ...allPortfolioItems.items,
    ];

    const workBreakdown: WorkAnalytics[] = allWork
      .filter(work => lecturerWorkIds.has(work.id))
      .map(work => ({
        id: work.id,
        title: work.title,
        type: work.type,
        likes: likesPerPost.get(work.id) || 0,
        saves: savesPerPost.get(work.id) || 0,
      }))
      .sort((a, b) => (b.likes + b.saves) - (a.likes + a.saves));

    const analyticsData: AnalyticsData = {
      totalLikes,
      totalSaves,
      workBreakdown,
    };

    return ok(c, analyticsData);
  });

  app.put('/api/users/:id', authMiddleware, async (c) => {
    const { id } = c.req.param();
    const body = await c.req.json<Partial<UserProfile>>();
    const user = new UserProfileEntity(c.env, id);
    if (!(await user.exists())) return notFound(c, 'User not found');
    await user.patch(body);
    return ok(c, await user.getState());
  });

  app.post('/api/users/me/change-password', authMiddleware, async (c) => {
    const payload = c.get('jwtPayload');
    const userId = payload.sub;
    if (!userId) return bad(c, 'User ID not found in token');

    const { currentPassword, newPassword } = await c.req.json();
    if (!currentPassword || !newPassword) {
      return bad(c, 'Current and new passwords are required');
    }

    const userEntity = new UserProfileEntity(c.env, userId);
    if (!(await userEntity.exists())) return notFound(c, 'User not found');

    const user = await userEntity.getState();
    if (user.password !== currentPassword) {
      return bad(c, 'Incorrect current password');
    }

    await userEntity.patch({ password: newPassword });
    return ok(c, { message: 'Password updated successfully' });
  });

  app.delete('/api/users/me', authMiddleware, async (c) => {
    const payload = c.get('jwtPayload');
    const userId = payload.sub;
    if (!userId) {
      return bad(c, 'User ID not found in token');
    }

    const userEntity = new UserProfileEntity(c.env, userId);
    if (!(await userEntity.exists())) return notFound(c, 'User not found');

    const user = await userEntity.getState();

    // Safely delete related entities if they exist
    if (user.publicationIds?.length > 0) await PublicationEntity.deleteMany(c.env, user.publicationIds);
    if (user.projectIds?.length > 0) await ResearchProjectEntity.deleteMany(c.env, user.projectIds);
    if (user.portfolioItemIds?.length > 0) await PortfolioItemEntity.deleteMany(c.env, user.portfolioItemIds);
    if (user.courseIds?.length > 0) await CourseEntity.deleteMany(c.env, user.courseIds);

    // Clean up comments and likes made by the user
    const allComments = (await CommentEntity.list(c.env)).items;
    const userComments = allComments.filter(comment => comment.userId === userId);
    if (userComments.length > 0) {
      await CommentEntity.deleteMany(c.env, userComments.map(c => c.id));
    }

    const allLikes = (await LikeEntity.list(c.env)).items;
    const userLikes = allLikes.filter(like => like.userId === userId);
    if (userLikes.length > 0) {
      await LikeEntity.deleteMany(c.env, userLikes.map(l => l.id));
    }

    const deleted = await UserProfileEntity.delete(c.env, userId);
    return ok(c, { id: userId, deleted });
  });

  app.post('/api/users/me/save/:postId', authMiddleware, async (c) => {
    const payload = c.get('jwtPayload');
    if (payload.role !== 'student') return c.json({ success: false, error: 'Only students can save items' }, 403);
    const userId = payload.sub;
    const { postId } = c.req.param();

    const userEntity = new UserProfileEntity(c.env, userId);
    if (!(await userEntity.exists())) return notFound(c, 'User not found');

    await userEntity.mutate(state => {
      const savedIds = state.savedItemIds ?? [];
      if (!savedIds.includes(postId)) {
        return { ...state, savedItemIds: [...savedIds, postId] };
      }
      return state;
    });

    return ok(c, await userEntity.getState());
  });

  app.delete('/api/users/me/save/:postId', authMiddleware, async (c) => {
    const payload = c.get('jwtPayload');
    if (payload.role !== 'student') return c.json({ success: false, error: 'Only students can unsave items' }, 403);
    const userId = payload.sub;
    const { postId } = c.req.param();

    const userEntity = new UserProfileEntity(c.env, userId);
    if (!(await userEntity.exists())) return notFound(c, 'User not found');

    await userEntity.mutate(state => ({
      ...state,
      savedItemIds: (state.savedItemIds ?? []).filter(id => id !== postId)
    }));

    return ok(c, await userEntity.getState());
  });

  app.post('/api/publications', authMiddleware, async (c) => {
    const body = await c.req.json<PublicationCreatePayload>();
    const { lecturerId, ...pubData } = body;
    if (!lecturerId) return bad(c, 'lecturerId is required');

    const user = new UserProfileEntity(c.env, lecturerId);
    if (!(await user.exists())) return notFound(c, 'User not found');

    const newPub: Publication = { ...pubData, id: crypto.randomUUID(), type: 'publication', lecturerId, commentIds: [], likeIds: [], createdAt: Date.now() };
    await PublicationEntity.create(c.env, newPub);
    await user.mutate(state => ({ ...state, publicationIds: [...(state.publicationIds ?? []), newPub.id] }));

    return ok(c, newPub);
  });

  app.put('/api/publications/:id', authMiddleware, async (c) => {
    const { id } = c.req.param();
    const body = await c.req.json<Partial<Publication>>();
    const pub = new PublicationEntity(c.env, id);
    if (!(await pub.exists())) return notFound(c, 'Publication not found');
    await pub.patch(body);
    return ok(c, await pub.getState());
  });

  app.delete('/api/publications/:id', authMiddleware, async (c) => {
    const { id } = c.req.param();
    const pubEntity = new PublicationEntity(c.env, id);
    if (!(await pubEntity.exists())) return notFound(c, 'Publication not found');

    const pub = await pubEntity.getState();
    const user = new UserProfileEntity(c.env, pub.lecturerId);
    if (await user.exists()) {
      await user.mutate(state => ({ ...state, publicationIds: state.publicationIds.filter(pubId => pubId !== id) }));
    }

    const deleted = await PublicationEntity.delete(c.env, id);
    return ok(c, { id, deleted });
  });

  app.post('/api/research', authMiddleware, async (c) => {
    const body = await c.req.json<ProjectCreatePayload>();
    const { lecturerId, ...projData } = body;
    if (!lecturerId) return bad(c, 'lecturerId is required');

    const user = new UserProfileEntity(c.env, lecturerId);
    if (!(await user.exists())) return notFound(c, 'User not found');

    const newProj: ResearchProject = { ...projData, id: crypto.randomUUID(), type: 'project', lecturerId, commentIds: [], likeIds: [], createdAt: Date.now() };
    await ResearchProjectEntity.create(c.env, newProj);
    await user.mutate(state => ({ ...state, projectIds: [...(state.projectIds ?? []), newProj.id] }));

    return ok(c, newProj);
  });

  app.put('/api/research/:id', authMiddleware, async (c) => {
    const { id } = c.req.param();
    const body = await c.req.json<Partial<ResearchProject>>();
    const proj = new ResearchProjectEntity(c.env, id);
    if (!(await proj.exists())) return notFound(c, 'Project not found');
    await proj.patch(body);
    return ok(c, await proj.getState());
  });

  app.delete('/api/research/:id', authMiddleware, async (c) => {
    const { id } = c.req.param();
    const projEntity = new ResearchProjectEntity(c.env, id);
    if (!(await projEntity.exists())) return notFound(c, 'Project not found');

    const proj = await projEntity.getState();
    const user = new UserProfileEntity(c.env, proj.lecturerId);
    if (await user.exists()) {
      await user.mutate(state => ({ ...state, projectIds: state.projectIds.filter(projId => projId !== id) }));
    }

    const deleted = await ResearchProjectEntity.delete(c.env, id);
    return ok(c, { id, deleted });
  });

  app.post('/api/portfolio', authMiddleware, async (c) => {
    const body = await c.req.json<PortfolioItemCreatePayload>();
    const { lecturerId, ...itemData } = body;
    if (!lecturerId) return bad(c, 'lecturerId is required');

    const user = new UserProfileEntity(c.env, lecturerId);
    if (!(await user.exists())) return notFound(c, 'User not found');

    const newItem: PortfolioItem = { ...itemData, id: crypto.randomUUID(), type: 'portfolio', lecturerId, commentIds: [], likeIds: [], createdAt: Date.now() };
    await PortfolioItemEntity.create(c.env, newItem);
    await user.mutate(state => ({ ...state, portfolioItemIds: [...(state.portfolioItemIds ?? []), newItem.id] }));

    return ok(c, newItem);
  });

  app.put('/api/portfolio/:id', authMiddleware, async (c) => {
    const { id } = c.req.param();
    const body = await c.req.json<Partial<PortfolioItem>>();
    const item = new PortfolioItemEntity(c.env, id);
    if (!(await item.exists())) return notFound(c, 'Portfolio item not found');
    await item.patch(body);
    return ok(c, await item.getState());
  });

  app.delete('/api/portfolio/:id', authMiddleware, async (c) => {
    const { id } = c.req.param();
    const itemEntity = new PortfolioItemEntity(c.env, id);
    if (!(await itemEntity.exists())) return notFound(c, 'Portfolio item not found');

    const item = await itemEntity.getState();
    const user = new UserProfileEntity(c.env, item.lecturerId);
    if (await user.exists()) {
      await user.mutate(state => ({ ...state, portfolioItemIds: state.portfolioItemIds.filter(itemId => itemId !== id) }));
    }

    const deleted = await PortfolioItemEntity.delete(c.env, id);
    return ok(c, { id, deleted });
  });

  app.post('/api/courses', authMiddleware, async (c) => {
    const body = await c.req.json<CourseCreatePayload>();
    const { lecturerId, ...courseData } = body;
    if (!lecturerId) return bad(c, 'lecturerId is required');

    const user = new UserProfileEntity(c.env, lecturerId);
    if (!(await user.exists())) return notFound(c, 'User not found');

    const newCourse: Course = { ...courseData, id: crypto.randomUUID(), lecturerId, studentProjectIds: [], createdAt: Date.now() };
    await CourseEntity.create(c.env, newCourse);
    await user.mutate(state => ({ ...state, courseIds: [...(state.courseIds ?? []), newCourse.id] }));

    return ok(c, newCourse);
  });

  app.put('/api/courses/:id', authMiddleware, async (c) => {
    const { id } = c.req.param();
    const body = await c.req.json<Partial<Course>>();
    const course = new CourseEntity(c.env, id);
    if (!(await course.exists())) return notFound(c, 'Course not found');
    await course.patch(body);
    return ok(c, await course.getState());
  });

  app.delete('/api/courses/:id', authMiddleware, async (c) => {
    const { id } = c.req.param();
    const courseEntity = new CourseEntity(c.env, id);
    if (!(await courseEntity.exists())) return notFound(c, 'Course not found');

    const course = await courseEntity.getState();
    const user = new UserProfileEntity(c.env, course.lecturerId);
    if (await user.exists()) {
      await user.mutate(state => ({ ...state, courseIds: state.courseIds.filter(cId => cId !== id) }));
    }

    if (course.studentProjectIds.length > 0) {
      await StudentProjectEntity.deleteMany(c.env, course.studentProjectIds);
    }

    const deleted = await CourseEntity.delete(c.env, id);
    return ok(c, { id, deleted });
  });

  app.post('/api/student-projects', authMiddleware, async (c) => {
    const body = await c.req.json<StudentProjectCreatePayload>();
    const { lecturerId, courseId, ...projData } = body;
    if (!lecturerId) return bad(c, 'lecturerId is required');
    if (!courseId) return bad(c, 'courseId is required');

    const course = new CourseEntity(c.env, courseId);
    if (!(await course.exists())) return notFound(c, 'Course not found');

    const newProj: StudentProject = { ...projData, id: crypto.randomUUID(), lecturerId, courseId, createdAt: Date.now() };
    await StudentProjectEntity.create(c.env, newProj);
    await course.mutate(state => ({ ...state, studentProjectIds: [...(state.studentProjectIds ?? []), newProj.id] }));

    return ok(c, newProj);
  });

  app.put('/api/student-projects/:id', authMiddleware, async (c) => {
    const { id } = c.req.param();
    const body = await c.req.json<Partial<StudentProject>>();
    const proj = new StudentProjectEntity(c.env, id);
    if (!(await proj.exists())) return notFound(c, 'Student Project not found');
    await proj.patch(body);
    return ok(c, await proj.getState());
  });

  app.delete('/api/student-projects/:id', authMiddleware, async (c) => {
    const { id } = c.req.param();
    const projEntity = new StudentProjectEntity(c.env, id);
    if (!(await projEntity.exists())) return notFound(c, 'Student Project not found');

    const proj = await projEntity.getState();
    const course = new CourseEntity(c.env, proj.courseId);
    if (await course.exists()) {
      await course.mutate(state => ({ ...state, studentProjectIds: state.studentProjectIds.filter(pId => pId !== id) }));
    }

    const deleted = await StudentProjectEntity.delete(c.env, id);
    return ok(c, { id, deleted });
  });

  app.post('/api/comments', authMiddleware, async (c) => {
    const payload = c.get('jwtPayload');
    if (payload.role !== 'student') return c.json({ success: false, error: 'Only students can comment' }, 403);
    const { postId, content } = await c.req.json<{ postId: string; content: string }>();

    const user = await new UserProfileEntity(c.env, payload.sub).getState();
    const newComment: Comment = { id: crypto.randomUUID(), postId, content, userId: user.id, userName: user.name, userPhotoUrl: user.photoUrl, createdAt: Date.now() };
    await CommentEntity.create(c.env, newComment);
    return ok(c, newComment);
  });

  app.post('/api/likes', authMiddleware, async (c) => {
    const payload = c.get('jwtPayload');
    if (payload.role !== 'student') return c.json({ success: false, error: 'Only students can like posts' }, 403);
    const { postId } = await c.req.json<{ postId: string }>();

    const allLikes = (await LikeEntity.list(c.env)).items;
    const existingLike = allLikes.find(l => l.postId === postId && l.userId === payload.sub);
    if (existingLike) return bad(c, 'You have already liked this post');

    const newLike: Like = { id: crypto.randomUUID(), postId, userId: payload.sub };
    await LikeEntity.create(c.env, newLike);
    return ok(c, newLike);
  });

  app.delete('/api/likes/:postId', authMiddleware, async (c) => {
    const payload = c.get('jwtPayload');
    if (payload.role !== 'student') return c.json({ success: false, error: 'Only students can unlike posts' }, 403);
    const { postId } = c.req.param();

    const allLikes = (await LikeEntity.list(c.env)).items;
    const likeToDelete = allLikes.find(l => l.postId === postId && l.userId === payload.sub);
    if (!likeToDelete) return notFound(c, 'Like not found');

    await LikeEntity.delete(c.env, likeToDelete.id);
    return ok(c, { id: likeToDelete.id, deleted: true });
  });

  app.delete('/api/comments/:id', authMiddleware, async (c) => {
    const payload = c.get('jwtPayload');
    const { id } = c.req.param();

    const commentEntity = new CommentEntity(c.env, id);
    if (!(await commentEntity.exists())) return notFound(c, 'Comment not found');

    const comment = await commentEntity.getState();

    // 1. Check if user is the comment author
    if (comment.userId === payload.sub) {
      await CommentEntity.delete(c.env, id);
      return ok(c, { id, deleted: true });
    }

    // 2. Check if user is the post owner (Lecturer)
    if (payload.role === 'lecturer') {
      let isPostOwner = false;
      const pub = await PublicationEntity.get(c.env, comment.postId);
      if (pub && pub.lecturerId === payload.sub) isPostOwner = true;

      if (!isPostOwner) {
        const proj = await ResearchProjectEntity.get(c.env, comment.postId);
        if (proj && proj.lecturerId === payload.sub) isPostOwner = true;
      }

      if (!isPostOwner) {
        const item = await PortfolioItemEntity.get(c.env, comment.postId);
        if (item && item.lecturerId === payload.sub) isPostOwner = true;
      }

      if (isPostOwner) {
        await CommentEntity.delete(c.env, id);
        return ok(c, { id, deleted: true });
      }
    }

    return c.json({ success: false, error: 'Unauthorized to delete this comment' }, 403);
  });

  app.get('/api/activity/recent', async (c) => {
    const [publications, projects, portfolioItems] = await Promise.all([
      PublicationEntity.list(c.env),
      ResearchProjectEntity.list(c.env),
      PortfolioItemEntity.list(c.env),
    ]);

    const allWork: AcademicWork[] = [
      ...publications.items,
      ...projects.items,
      ...portfolioItems.items,
    ];

    const recentWork = allWork
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 10);

    return ok(c, recentWork);
  });

  app.get('/api/users/search', async (c) => {
    const { q, university, department } = c.req.query();
    const searchTerm = q?.toLowerCase() || '';

    const page = await UserProfileEntity.list(c.env);
    let users = page.items.map(l => { const { password, ...rest } = l; return rest; });

    if (searchTerm) {
      users = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm) ||
        user.specializations.some(spec => spec.toLowerCase().includes(searchTerm)) ||
        user.university.toLowerCase().includes(searchTerm)
      );
    }
    if (university) {
      users = users.filter(user => user.university === university);
    }
    if (department) {
      users = users.filter(user => user.department === department);
    }

    return ok(c, users);
  });

  app.get('/api/users', async (c) => {
    const page = await UserProfileEntity.list(c.env);
    const users = page.items.map(l => { const { password, ...rest } = l; return rest; });
    return ok(c, users);
  });

  app.get('/api/users/:id', async (c) => {
    const { id } = c.req.param();
    const user = new UserProfileEntity(c.env, id);
    if (!(await user.exists())) return notFound(c, 'User not found');
    const state = await user.getState();
    const { password, ...rest } = state;
    return ok(c, rest);
  });

  app.get('/api/publications', async (c) => {
    const { q, year } = c.req.query();
    const searchTerm = q?.toLowerCase() || '';
    let items = (await PublicationEntity.list(c.env)).items;

    if (searchTerm) {
      items = items.filter(item =>
        item.title.toLowerCase().includes(searchTerm) ||
        item.authors.some(author => author.toLowerCase().includes(searchTerm)) ||
        item.journal.toLowerCase().includes(searchTerm)
      );
    }
    if (year) {
      items = items.filter(item => item.year.toString() === year);
    }
    return ok(c, items);
  });

  app.get('/api/publications/years', async (c) => {
    const items = (await PublicationEntity.list(c.env)).items;
    const years = [...new Set(items.map(item => item.year))].sort((a, b) => b - a);
    return ok(c, years);
  });

  app.get('/api/research', async (c) => {
    const { q, year } = c.req.query();
    const searchTerm = q?.toLowerCase() || '';
    let items = (await ResearchProjectEntity.list(c.env)).items;

    if (searchTerm) {
      items = items.filter(item =>
        item.title.toLowerCase().includes(searchTerm) ||
        item.description.toLowerCase().includes(searchTerm)
      );
    }
    if (year) {
      items = items.filter(item => item.year.toString() === year);
    }
    return ok(c, items);
  });

  app.get('/api/research/years', async (c) => {
    const items = (await ResearchProjectEntity.list(c.env)).items;
    const years = [...new Set(items.map(item => item.year))].sort((a, b) => b - a);
    return ok(c, years);
  });

  app.get('/api/research/:id', async (c) => {
    const { id } = c.req.param();
    const project = await ResearchProjectEntity.get(c.env, id);
    if (!project) return notFound(c, 'Research project not found');
    return ok(c, project);
  });

  app.get('/api/portfolio', async (c) => {
    const { q, year } = c.req.query();
    const searchTerm = q?.toLowerCase() || '';
    let items = (await PortfolioItemEntity.list(c.env)).items;

    if (searchTerm) {
      items = items.filter(item =>
        item.title.toLowerCase().includes(searchTerm) ||
        item.description.toLowerCase().includes(searchTerm) ||
        item.category.toLowerCase().includes(searchTerm)
      );
    }
    if (year) {
      items = items.filter(item => item.year.toString() === year);
    }
    return ok(c, items);
  });

  app.get('/api/portfolio/years', async (c) => {
    const items = (await PortfolioItemEntity.list(c.env)).items;
    const years = [...new Set(items.map(item => item.year))].sort((a, b) => b - a);
    return ok(c, years);
  });

  app.get('/api/courses', async (c) => {
    const { lecturerId } = c.req.query();
    let items = (await CourseEntity.list(c.env)).items;
    if (lecturerId) {
      items = items.filter(item => item.lecturerId === lecturerId);
    }
    return ok(c, items);
  });

  app.get('/api/courses/:id', async (c) => {
    const { id } = c.req.param();
    const course = await CourseEntity.get(c.env, id);
    if (!course) return notFound(c, 'Course not found');
    return ok(c, course);
  });

  app.get('/api/student-projects', async (c) => {
    const { courseId, lecturerId } = c.req.query();
    let items = (await StudentProjectEntity.list(c.env)).items;
    if (courseId) {
      items = items.filter(item => item.courseId === courseId);
    }
    if (lecturerId) {
      items = items.filter(item => item.lecturerId === lecturerId);
    }
    return ok(c, items);
  });

  app.get('/api/academic-work/:id', async (c) => {
    const { id } = c.req.param();
    const publication = await PublicationEntity.get(c.env, id);
    if (publication) return ok(c, publication);
    const project = await ResearchProjectEntity.get(c.env, id);
    if (project) return ok(c, project);
    const portfolioItem = await PortfolioItemEntity.get(c.env, id);
    if (portfolioItem) return ok(c, portfolioItem);
    return notFound(c, 'Academic work not found');
  });

  app.get('/api/posts/:postId/comments', async (c) => {
    const { postId } = c.req.param();
    const allComments = (await CommentEntity.list(c.env)).items;
    const postComments = allComments.filter(comment => comment.postId === postId).sort((a, b) => b.createdAt - a.createdAt);
    return ok(c, postComments);
  });

  app.get('/api/posts/:postId/likes', async (c) => {
    const { postId } = c.req.param();
    const allLikes = (await LikeEntity.list(c.env)).items;
    const postLikes = allLikes.filter(like => like.postId === postId);
    return ok(c, postLikes);
  });

  app.post('/api/saved-items', async (c) => {
    const { itemIds } = await c.req.json<{ itemIds?: string[] }>();
    if (!itemIds || !Array.isArray(itemIds)) {
      return bad(c, 'itemIds array is required');
    }

    const [publications, projects, portfolioItems, usersPage] = await Promise.all([
      PublicationEntity.list(c.env),
      ResearchProjectEntity.list(c.env),
      PortfolioItemEntity.list(c.env),
      UserProfileEntity.list(c.env)
    ]);

    const allAcademicWork = [
      ...publications.items,
      ...projects.items,
      ...portfolioItems.items
    ];

    const users = usersPage.items;
    const userMap = new Map(users.map(u => [u.id, u.name]));

    const savedItems = allAcademicWork
      .filter(item => itemIds.includes(item.id))
      .map(item => ({
        ...item,
        authorName: userMap.get(item.lecturerId) || 'Unknown Author'
      }));

    return ok(c, savedItems);
  });
}