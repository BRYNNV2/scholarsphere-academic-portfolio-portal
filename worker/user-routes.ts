import { Hono } from "hono";
import { jwt, sign } from 'hono/jwt'
import type { Env } from './core-utils';
import { UserProfileEntity, PublicationEntity, ResearchProjectEntity, PortfolioItemEntity, CommentEntity, LikeEntity } from "./entities";
import { ok, bad, notFound } from './core-utils';
import type { UserProfile, Publication, ResearchProject, PortfolioItem, Comment, Like, AnalyticsData, WorkAnalytics } from "@shared/types";
type PublicationCreatePayload = Omit<Publication, 'id' | 'type' | 'lecturerId'> & { lecturerId: string };
type ProjectCreatePayload = Omit<ResearchProject, 'id' | 'type' | 'lecturerId'> & { lecturerId: string };
type PortfolioItemCreatePayload = Omit<PortfolioItem, 'id' | 'type' | 'lecturerId'> & { lecturerId: string };
const JWT_SECRET = 'a-very-secret-key-that-should-be-in-env';
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
      savedItemIds: [],
      specializations: body.specializations || [],
      socialLinks: body.socialLinks || {},
      photoUrl: body.photoUrl || `https://i.pravatar.cc/300?u=${body.email}`,
    };
    await UserProfileEntity.create(c.env, newUser);
    const { password, ...userToReturn } = newUser;
    const token = await sign({ sub: userToReturn.id, role: userToReturn.role }, JWT_SECRET);
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
    const token = await sign({ sub: userToReturn.id, role: userToReturn.role }, JWT_SECRET);
    return ok(c, { user: userToReturn, token });
  });
  app.route('/api/auth', auth);
  // --- SECURED ROUTES ---
  const secured = new Hono<{ Bindings: Env }>();
  secured.use('*', jwt({ secret: JWT_SECRET }));
  secured.get('/users/me/analytics', async (c) => {
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
  secured.put('/users/:id', async (c) => {
    const { id } = c.req.param();
    const body = await c.req.json<Partial<UserProfile>>();
    const user = new UserProfileEntity(c.env, id);
    if (!(await user.exists())) return notFound(c, 'User not found');
    await user.patch(body);
    return ok(c, await user.getState());
  });
  secured.post('/users/me/change-password', async (c) => {
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
  secured.delete('/users/me', async (c) => {
    const payload = c.get('jwtPayload');
    const userId = payload.sub;
    if (!userId) {
      return bad(c, 'User ID not found in token');
    }
    const userEntity = new UserProfileEntity(c.env, userId);
    if (!(await userEntity.exists())) return notFound(c, 'User not found');
    const user = await userEntity.getState();
    if (user.publicationIds.length > 0) await PublicationEntity.deleteMany(c.env, user.publicationIds);
    if (user.projectIds.length > 0) await ResearchProjectEntity.deleteMany(c.env, user.projectIds);
    if (user.portfolioItemIds.length > 0) await PortfolioItemEntity.deleteMany(c.env, user.portfolioItemIds);
    const deleted = await UserProfileEntity.delete(c.env, userId);
    return ok(c, { id: userId, deleted });
  });
  secured.post('/users/me/save/:postId', async (c) => {
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
  secured.delete('/users/me/save/:postId', async (c) => {
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
  secured.post('/publications', async (c) => {
    const body = await c.req.json<PublicationCreatePayload>();
    const { lecturerId, ...pubData } = body;
    if (!lecturerId) return bad(c, 'lecturerId is required');
    const user = new UserProfileEntity(c.env, lecturerId);
    if (!(await user.exists())) return notFound(c, 'User not found');
    const newPub: Publication = { ...pubData, id: crypto.randomUUID(), type: 'publication', lecturerId, commentIds: [], likeIds: [] };
    await PublicationEntity.create(c.env, newPub);
    await user.mutate(state => ({ ...state, publicationIds: [...(state.publicationIds ?? []), newPub.id] }));
    return ok(c, newPub);
  });
  secured.put('/publications/:id', async (c) => {
    const { id } = c.req.param();
    const body = await c.req.json<Partial<Publication>>();
    const pub = new PublicationEntity(c.env, id);
    if (!(await pub.exists())) return notFound(c, 'Publication not found');
    await pub.patch(body);
    return ok(c, await pub.getState());
  });
  secured.delete('/publications/:id', async (c) => {
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
  secured.post('/research', async (c) => {
    const body = await c.req.json<ProjectCreatePayload>();
    const { lecturerId, ...projData } = body;
    if (!lecturerId) return bad(c, 'lecturerId is required');
    const user = new UserProfileEntity(c.env, lecturerId);
    if (!(await user.exists())) return notFound(c, 'User not found');
    const newProj: ResearchProject = { ...projData, id: crypto.randomUUID(), type: 'project', lecturerId, commentIds: [], likeIds: [] };
    await ResearchProjectEntity.create(c.env, newProj);
    await user.mutate(state => ({ ...state, projectIds: [...(state.projectIds ?? []), newProj.id] }));
    return ok(c, newProj);
  });
  secured.put('/research/:id', async (c) => {
    const { id } = c.req.param();
    const body = await c.req.json<Partial<ResearchProject>>();
    const proj = new ResearchProjectEntity(c.env, id);
    if (!(await proj.exists())) return notFound(c, 'Project not found');
    await proj.patch(body);
    return ok(c, await proj.getState());
  });
  secured.delete('/research/:id', async (c) => {
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
  secured.post('/portfolio', async (c) => {
    const body = await c.req.json<PortfolioItemCreatePayload>();
    const { lecturerId, ...itemData } = body;
    if (!lecturerId) return bad(c, 'lecturerId is required');
    const user = new UserProfileEntity(c.env, lecturerId);
    if (!(await user.exists())) return notFound(c, 'User not found');
    const newItem: PortfolioItem = { ...itemData, id: crypto.randomUUID(), type: 'portfolio', lecturerId, commentIds: [], likeIds: [] };
    await PortfolioItemEntity.create(c.env, newItem);
    await user.mutate(state => ({ ...state, portfolioItemIds: [...(state.portfolioItemIds ?? []), newItem.id] }));
    return ok(c, newItem);
  });
  secured.put('/portfolio/:id', async (c) => {
    const { id } = c.req.param();
    const body = await c.req.json<Partial<PortfolioItem>>();
    const item = new PortfolioItemEntity(c.env, id);
    if (!(await item.exists())) return notFound(c, 'Portfolio item not found');
    await item.patch(body);
    return ok(c, await item.getState());
  });
  secured.delete('/portfolio/:id', async (c) => {
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
  secured.post('/comments', async (c) => {
    const payload = c.get('jwtPayload');
    if (payload.role !== 'student') return c.json({ success: false, error: 'Only students can comment' }, 403);
    const { postId, content } = await c.req.json<{ postId: string; content: string }>();
    const user = await new UserProfileEntity(c.env, payload.sub).getState();
    const newComment: Comment = { id: crypto.randomUUID(), postId, content, userId: user.id, userName: user.name, userPhotoUrl: user.photoUrl, createdAt: Date.now() };
    await CommentEntity.create(c.env, newComment);
    return ok(c, newComment);
  });
  secured.post('/likes', async (c) => {
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
  secured.delete('/likes/:postId', async (c) => {
    const payload = c.get('jwtPayload');
    if (payload.role !== 'student') return c.json({ success: false, error: 'Only students can unlike posts' }, 403);
    const { postId } = c.req.param();
    const allLikes = (await LikeEntity.list(c.env)).items;
    const likeToDelete = allLikes.find(l => l.postId === postId && l.userId === payload.sub);
    if (!likeToDelete) return notFound(c, 'Like not found');
    await LikeEntity.delete(c.env, likeToDelete.id);
    return ok(c, { id: likeToDelete.id, deleted: true });
  });
  // --- PUBLIC ROUTES ---
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
  app.route('/api', secured);
}