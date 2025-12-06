import { Hono } from "hono";
import { jwt, sign, verify } from 'hono/jwt'
import type { Env } from './core-utils';
import { UserProfileEntity, PublicationEntity, ResearchProjectEntity, PortfolioItemEntity, CommentEntity, LikeEntity, CourseEntity, StudentProjectEntity, NotificationEntity } from "./entities";
import { ok, bad, notFound } from './core-utils';
import type { UserProfile, Publication, ResearchProject, PortfolioItem, Comment, Like, AnalyticsData, WorkAnalytics, AcademicWork, Course, StudentProject, Notification } from "@shared/types";

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

    // Check if username exists if provided
    if (body.username) {
      const existingUsername = users.find(u => u.username === body.username);
      if (existingUsername) {
        return bad(c, 'Username already taken');
      }
    }

    const newUser: UserProfile = {
      id: crypto.randomUUID(),
      username: body.username || body.email.split('@')[0], // Default username from email if not provided
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

    // Clean up references
    // This is a simplified cleanup. In a real app, you'd want to be more thorough
    // or use soft deletes.

    await UserProfileEntity.delete(c.env, userId);
    return ok(c, { message: 'User deleted successfully' });
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

    const newProj: StudentProject = { ...projData, id: crypto.randomUUID(), lecturerId, courseId, createdAt: Date.now(), type: 'student-project' };
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
    const { postId, content, parentId } = await c.req.json<{ postId: string; content: string; parentId?: string }>();

    const user = await new UserProfileEntity(c.env, payload.sub).getState();
    const newComment: Comment = { id: crypto.randomUUID(), postId, content, userId: user.id, userName: user.name, userPhotoUrl: user.photoUrl, likeIds: [], parentId, createdAt: Date.now() };
    await CommentEntity.create(c.env, newComment);

    // Trigger Notification
    try {
      let resourceOwnerId = '';
      let resourceTitle = '';
      let resourceType: any = 'publication';

      const pub = await PublicationEntity.get(c.env, postId);
      if (pub) {
        resourceOwnerId = pub.lecturerId;
        resourceTitle = pub.title;
        resourceType = 'publication';
      } else {
        const proj = await ResearchProjectEntity.get(c.env, postId);
        if (proj) {
          resourceOwnerId = proj.lecturerId;
          resourceTitle = proj.title;
          resourceType = 'project';
        } else {
          const item = await PortfolioItemEntity.get(c.env, postId);
          if (item) {
            resourceOwnerId = item.lecturerId;
            resourceTitle = item.title;
            resourceType = 'portfolio';
          } else {
            const studentProj = await StudentProjectEntity.get(c.env, postId);
            if (studentProj) {
              resourceOwnerId = studentProj.lecturerId;
              resourceTitle = studentProj.title;
              resourceType = 'project';
            }
          }
        }
      }

      if (resourceOwnerId && resourceOwnerId !== user.id) {
        const notification: Notification = {
          id: crypto.randomUUID(),
          userId: resourceOwnerId,
          type: 'comment',
          actorId: user.id,
          actorName: user.name,
          actorPhotoUrl: user.photoUrl,
          resourceId: postId,
          resourceType,
          resourceTitle,
          message: `${user.name} commented on your ${resourceType}: "${resourceTitle}"`,
          isRead: false,
          createdAt: Date.now()
        };
        await NotificationEntity.create(c.env, notification);
      }

      // Trigger Notification for Parent Comment (Reply)
      if (parentId) {
        const parentComment = await CommentEntity.get(c.env, parentId);
        if (parentComment && parentComment.userId !== user.id) {
          const notification: Notification = {
            id: crypto.randomUUID(),
            userId: parentComment.userId,
            type: 'comment',
            actorId: user.id,
            actorName: user.name,
            actorPhotoUrl: user.photoUrl,
            resourceId: postId,
            resourceType,
            resourceTitle,
            message: `${user.name} replied to your comment on "${resourceTitle}"`,
            isRead: false,
            createdAt: Date.now()
          };
          await NotificationEntity.create(c.env, notification);
        }
      }

    } catch (e) {
      console.error('Failed to create notification', e);
    }

    return ok(c, newComment);
  });

  app.get('/api/posts/:postId/comments', async (c) => {
    const { postId } = c.req.param();
    const allComments = (await CommentEntity.list(c.env)).items;
    const postComments = allComments
      .filter(comment => comment.postId === postId)
      .sort((a, b) => b.createdAt - a.createdAt);
    return ok(c, postComments);
  });

  app.get('/api/posts/:postId/likes', async (c) => {
    const { postId } = c.req.param();
    const allLikes = (await LikeEntity.list(c.env)).items;
    const postLikes = allLikes.filter(like => like.postId === postId);
    return ok(c, postLikes);
  });

  app.post('/api/likes', authMiddleware, async (c) => {
    const payload = c.get('jwtPayload');
    const { postId } = await c.req.json<{ postId: string }>();

    const allLikes = (await LikeEntity.list(c.env)).items;
    const existingLike = allLikes.find(l => l.postId === postId && l.userId === payload.sub);
    if (existingLike) return bad(c, 'You have already liked this post');

    const newLike: Like = { id: crypto.randomUUID(), postId, userId: payload.sub };
    await LikeEntity.create(c.env, newLike);

    // Trigger Notification
    try {
      let resourceOwnerId = '';
      let resourceTitle = '';
      let resourceType: any = 'publication';

      const pub = await PublicationEntity.get(c.env, postId);
      if (pub) {
        resourceOwnerId = pub.lecturerId;
        resourceTitle = pub.title;
        resourceType = 'publication';
      } else {
        const proj = await ResearchProjectEntity.get(c.env, postId);
        if (proj) {
          resourceOwnerId = proj.lecturerId;
          resourceTitle = proj.title;
          resourceType = 'project';
        } else {
          const item = await PortfolioItemEntity.get(c.env, postId);
          if (item) {
            resourceOwnerId = item.lecturerId;
            resourceTitle = item.title;
            resourceType = 'portfolio';
          } else {
            const studentProj = await StudentProjectEntity.get(c.env, postId);
            if (studentProj) {
              resourceOwnerId = studentProj.lecturerId;
              resourceTitle = studentProj.title;
              resourceType = 'project';
            }
          }
        }
      }

      if (resourceOwnerId && resourceOwnerId !== payload.sub) {
        const user = await new UserProfileEntity(c.env, payload.sub).getState();
        const notification: Notification = {
          id: crypto.randomUUID(),
          userId: resourceOwnerId,
          type: 'like',
          actorId: user.id,
          actorName: user.name,
          actorPhotoUrl: user.photoUrl,
          resourceId: postId,
          resourceType,
          resourceTitle,
          message: `${user.name} liked your ${resourceType}: "${resourceTitle}"`,
          isRead: false,
          createdAt: Date.now()
        };
        await NotificationEntity.create(c.env, notification);
      }
    } catch (e) {
      console.error('Failed to create notification', e);
    }

    return ok(c, newLike);
  });

  app.delete('/api/likes/:postId', authMiddleware, async (c) => {
    const payload = c.get('jwtPayload');
    const { postId } = c.req.param();

    const allLikes = (await LikeEntity.list(c.env)).items;
    const likeToDelete = allLikes.find(l => l.postId === postId && l.userId === payload.sub);
    if (!likeToDelete) return notFound(c, 'Like not found');

    await LikeEntity.delete(c.env, likeToDelete.id);
    return ok(c, { id: likeToDelete.id, deleted: true });
  });

  app.post('/api/comments/:commentId/like', authMiddleware, async (c) => {
    const payload = c.get('jwtPayload');
    const { commentId } = c.req.param();
    const user = await new UserProfileEntity(c.env, payload.sub).getState();

    const commentEntity = new CommentEntity(c.env, commentId);
    if (!(await commentEntity.exists())) return notFound(c, 'Comment not found');

    const comment = await commentEntity.getState();
    if (comment.likeIds?.includes(user.id)) return bad(c, 'Already liked');

    const updatedComment = { ...comment, likeIds: [...(comment.likeIds || []), user.id] };
    await commentEntity.save(updatedComment);

    // Notification for comment owner
    if (comment.userId !== user.id) {
      let resourceTitle = 'post';
      const pub = await PublicationEntity.get(c.env, comment.postId);
      if (pub) resourceTitle = pub.title;
      else {
        const proj = await ResearchProjectEntity.get(c.env, comment.postId);
        if (proj) resourceTitle = proj.title;
        else {
          const item = await PortfolioItemEntity.get(c.env, comment.postId);
          if (item) resourceTitle = item.title;
          else {
            const sp = await StudentProjectEntity.get(c.env, comment.postId);
            if (sp) resourceTitle = sp.title;
          }
        }
      }

      const notification: Notification = {
        id: crypto.randomUUID(),
        userId: comment.userId,
        type: 'like',
        actorId: user.id,
        actorName: user.name,
        actorPhotoUrl: user.photoUrl,
        resourceId: comment.postId,
        resourceType: 'publication',
        resourceTitle,
        message: `${user.name} liked your comment on "${resourceTitle}"`,
        isRead: false,
        createdAt: Date.now()
      };
      await NotificationEntity.create(c.env, notification);
    }

    return ok(c, updatedComment);
  });

  app.delete('/api/comments/:commentId/like', authMiddleware, async (c) => {
    const payload = c.get('jwtPayload');
    const { commentId } = c.req.param();

    const commentEntity = new CommentEntity(c.env, commentId);
    if (!(await commentEntity.exists())) return notFound(c, 'Comment not found');

    const comment = await commentEntity.getState();
    const updatedComment = { ...comment, likeIds: (comment.likeIds || []).filter(id => id !== payload.sub) };
    await commentEntity.save(updatedComment);

    return ok(c, updatedComment);
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

    const secret = c.env.JWT_SECRET || 'dev-fallback-secret';
    let currentUserId: string | undefined;
    try {
      const token = c.req.header('Authorization')?.split(' ')[1];
      if (token) {
        const payload = await verify(token, secret);
        currentUserId = payload.sub as string;
      }
    } catch (e) {
      // ignore
    }

    const recentWork = allWork
      .filter(item => item.visibility !== 'private' || item.lecturerId === currentUserId)
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

  app.get('/api/users/username/:username', async (c) => {
    const { username } = c.req.param();
    const page = await UserProfileEntity.list(c.env);
    const user = page.items.find(u => u.username === username);
    if (!user) return notFound(c, 'User not found');
    const { password, ...rest } = user;
    return ok(c, rest);
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

    const secret = c.env.JWT_SECRET || 'dev-fallback-secret';
    let currentUserId: string | undefined;
    try {
      const token = c.req.header('Authorization')?.split(' ')[1];
      if (token) {
        const payload = await verify(token, secret);
        currentUserId = payload.sub as string;
      }
    } catch (e) {
      // ignore
    }

    items = items.filter(item => item.visibility !== 'private' || item.lecturerId === currentUserId);

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

    const secret = c.env.JWT_SECRET || 'dev-fallback-secret';
    let currentUserId: string | undefined;
    try {
      const token = c.req.header('Authorization')?.split(' ')[1];
      if (token) {
        const payload = await verify(token, secret);
        currentUserId = payload.sub as string;
      }
    } catch (e) {
      // ignore
    }

    items = items.filter(item => item.visibility !== 'private' || item.lecturerId === currentUserId);

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

    const secret = c.env.JWT_SECRET || 'dev-fallback-secret';
    let currentUserId: string | undefined;
    try {
      const token = c.req.header('Authorization')?.split(' ')[1];
      if (token) {
        const payload = await verify(token, secret);
        currentUserId = payload.sub as string;
      }
    } catch (e) {
      // ignore
    }

    items = items.filter(item => item.visibility !== 'private' || item.lecturerId === currentUserId);

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
    const { q, year, lecturerId } = c.req.query();
    const searchTerm = q?.toLowerCase() || '';
    let items = (await CourseEntity.list(c.env)).items;

    const secret = c.env.JWT_SECRET || 'dev-fallback-secret';
    let currentUserId: string | undefined;
    try {
      const token = c.req.header('Authorization')?.split(' ')[1];
      if (token) {
        const payload = await verify(token, secret);
        currentUserId = payload.sub as string;
      }
    } catch (e) {
      // ignore
    }

    items = items.filter(item => item.visibility !== 'private' || item.lecturerId === currentUserId);

    if (lecturerId) {
      items = items.filter(item => item.lecturerId === lecturerId);
    }
    if (searchTerm) {
      items = items.filter(item =>
        item.title.toLowerCase().includes(searchTerm) ||
        item.code.toLowerCase().includes(searchTerm) ||
        item.description.toLowerCase().includes(searchTerm)
      );
    }
    if (year) {
      items = items.filter(item => item.year.toString() === year);
    }
    return ok(c, items);
  });

  app.get('/api/courses/years', async (c) => {
    const items = (await CourseEntity.list(c.env)).items;
    const years = [...new Set(items.map(item => item.year))].sort((a, b) => b - a);
    return ok(c, years);
  });

  app.get('/api/courses/:id', async (c) => {
    const { id } = c.req.param();
    const course = await CourseEntity.get(c.env, id);
    if (!course) return notFound(c, 'Course not found');
    return ok(c, course);
  });

  app.get('/api/student-projects', async (c) => {
    const { q, courseId, lecturerId } = c.req.query();
    const searchTerm = q?.toLowerCase() || '';
    let items = (await StudentProjectEntity.list(c.env)).items;

    const secret = c.env.JWT_SECRET || 'dev-fallback-secret';
    let currentUserId: string | undefined;
    try {
      const token = c.req.header('Authorization')?.split(' ')[1];
      if (token) {
        const payload = await verify(token, secret);
        currentUserId = payload.sub as string;
      }
    } catch (e) {
      // ignore
    }

    items = items.filter(item => item.visibility !== 'private' || item.lecturerId === currentUserId);

    if (lecturerId) {
      items = items.filter(item => item.lecturerId === lecturerId);
    }
    if (courseId) {
      items = items.filter(item => item.courseId === courseId);
    }
    if (searchTerm) {
      items = items.filter(item =>
        item.title.toLowerCase().includes(searchTerm) ||
        item.description.toLowerCase().includes(searchTerm) ||
        item.students.some(s => s.toLowerCase().includes(searchTerm))
      );
    }
    return ok(c, items);
  });

  app.get('/api/academic-work/:id', async (c) => {
    const { id } = c.req.param();

    // Try finding in all collections
    const [pub, proj, item, studentProj] = await Promise.all([
      PublicationEntity.get(c.env, id),
      ResearchProjectEntity.get(c.env, id),
      PortfolioItemEntity.get(c.env, id),
      StudentProjectEntity.get(c.env, id)
    ]);

    if (pub) return ok(c, pub);
    if (proj) return ok(c, proj);
    if (item) return ok(c, item);

    if (studentProj) return ok(c, { ...studentProj, type: 'student-project' });

    return notFound(c, 'Academic work not found');
  });

  app.post('/api/users/me/saved-items', authMiddleware, async (c) => {
    const payload = c.get('jwtPayload');
    const { itemId, type } = await c.req.json();
    if (!itemId || !type) return bad(c, 'itemId and type are required');

    const userEntity = new UserProfileEntity(c.env, payload.sub);
    if (!(await userEntity.exists())) return notFound(c, 'User not found');

    await userEntity.mutate(state => {
      const saved = new Set(state.savedItemIds || []);
      saved.add(itemId);
      return { ...state, savedItemIds: Array.from(saved) };
    });

    return ok(c, { success: true });
  });

  app.delete('/api/users/me/saved-items/:itemId', authMiddleware, async (c) => {
    const payload = c.get('jwtPayload');
    const { itemId } = c.req.param();

    const userEntity = new UserProfileEntity(c.env, payload.sub);
    if (!(await userEntity.exists())) return notFound(c, 'User not found');

    await userEntity.mutate(state => ({
      ...state,
      savedItemIds: (state.savedItemIds || []).filter(id => id !== itemId)
    }));

    return ok(c, { success: true });
  });

  app.get('/api/users/me/saved-items', authMiddleware, async (c) => {
    const payload = c.get('jwtPayload');
    const user = await new UserProfileEntity(c.env, payload.sub).getState();

    const savedIds = user.savedItemIds || [];
    if (savedIds.length === 0) return ok(c, []);

    const [publications, projects, portfolioItems, usersPage] = await Promise.all([
      PublicationEntity.list(c.env),
      ResearchProjectEntity.list(c.env),
      PortfolioItemEntity.list(c.env),
      UserProfileEntity.list(c.env),
    ]);

    const allWork = [
      ...publications.items,
      ...projects.items,
      ...portfolioItems.items,
    ];

    const userMap = new Map(usersPage.items.map(u => [u.id, u.name]));

    const savedItems = allWork
      .filter(item => savedIds.includes(item.id))
      .map(item => {
        let authorName = 'Unknown';
        if (item.type === 'publication') {
          authorName = item.authors.join(', ');
        } else {
          authorName = userMap.get(item.lecturerId) || 'Unknown';
        }
        return { ...item, authorName };
      });

    return ok(c, savedItems);
  });

  // --- NOTIFICATIONS ---
  app.get('/api/notifications', authMiddleware, async (c) => {
    const payload = c.get('jwtPayload');
    const userId = payload.sub;

    const allNotifications = (await NotificationEntity.list(c.env)).items;
    const userNotifications = allNotifications
      .filter(n => n.userId === userId)
      .sort((a, b) => b.createdAt - a.createdAt);

    return ok(c, userNotifications);
  });

  app.put('/api/notifications/:id/read', authMiddleware, async (c) => {
    const { id } = c.req.param();
    const payload = c.get('jwtPayload');

    const notificationEntity = new NotificationEntity(c.env, id);
    if (!(await notificationEntity.exists())) return notFound(c, 'Notification not found');

    const notification = await notificationEntity.getState();
    if (notification.userId !== payload.sub) return c.json({ success: false, error: 'Unauthorized' }, 403);

    await notificationEntity.patch({ isRead: true });
    return ok(c, { success: true });
  });

  app.put('/api/notifications/read-all', authMiddleware, async (c) => {
    const payload = c.get('jwtPayload');
    const userId = payload.sub;

    const allNotifications = (await NotificationEntity.list(c.env)).items;
    const userUnreadNotifications = allNotifications.filter(n => n.userId === userId && !n.isRead);

    for (const notification of userUnreadNotifications) {
      const entity = new NotificationEntity(c.env, notification.id);
      await entity.patch({ isRead: true });
    }

    return ok(c, { success: true, count: userUnreadNotifications.length });
  });

  app.delete('/api/notifications/:id', authMiddleware, async (c) => {
    const { id } = c.req.param();
    const payload = c.get('jwtPayload');

    const notificationEntity = new NotificationEntity(c.env, id);
    if (!(await notificationEntity.exists())) return notFound(c, 'Notification not found');

    const notification = await notificationEntity.getState();
    if (notification.userId !== payload.sub) return c.json({ success: false, error: 'Unauthorized' }, 403);

    await NotificationEntity.delete(c.env, id);
    return ok(c, { success: true, id });
  });

  app.delete('/api/notifications', authMiddleware, async (c) => {
    const payload = c.get('jwtPayload');
    const userId = payload.sub;

    const allNotifications = (await NotificationEntity.list(c.env)).items;
    const userNotifications = allNotifications.filter(n => n.userId === userId);

    for (const notification of userNotifications) {
      await NotificationEntity.delete(c.env, notification.id);
    }

    return ok(c, { success: true, count: userNotifications.length });
  });

  // --- SAVED ITEMS ---

  // Helper to fetch academic work from any entity type
  const fetchAcademicWork = async (env: Env, id: string): Promise<AcademicWork | null> => {
    // Try Publication
    const pub = await PublicationEntity.get(env, id);
    if (pub) return pub;

    // Try ResearchProject
    const proj = await ResearchProjectEntity.get(env, id);
    if (proj) return proj;

    // Try PortfolioItem
    const port = await PortfolioItemEntity.get(env, id);
    if (port) return port;

    // Try StudentProject
    const studentProj = await StudentProjectEntity.get(env, id);
    if (studentProj) return studentProj;

    return null;
  };

  app.post('/api/users/me/save/:id', authMiddleware, async (c) => {
    const { id } = c.req.param();
    const payload = c.get('jwtPayload');
    const userId = payload.sub;

    // Verify item exists
    const item = await fetchAcademicWork(c.env, id);
    if (!item) {
      return notFound(c, 'Item not found');
    }

    const userEntity = new UserProfileEntity(c.env, userId);
    const user = await userEntity.getState();

    // Add to savedItemIds if not already present
    if (!user.savedItemIds.includes(id)) {
      const updatedSavedIds = [...user.savedItemIds, id];
      await userEntity.patch({ savedItemIds: updatedSavedIds });

      // Return updated user profile
      const updatedUser = await userEntity.getState();
      const { password, ...userToReturn } = updatedUser;
      return ok(c, userToReturn);
    }

    const { password, ...userToReturn } = user;
    return ok(c, userToReturn);
  });

  app.delete('/api/users/me/save/:id', authMiddleware, async (c) => {
    const { id } = c.req.param();
    const payload = c.get('jwtPayload');
    const userId = payload.sub;

    const userEntity = new UserProfileEntity(c.env, userId);
    const user = await userEntity.getState();

    // Remove from savedItemIds
    if (user.savedItemIds.includes(id)) {
      const updatedSavedIds = user.savedItemIds.filter(savedId => savedId !== id);
      await userEntity.patch({ savedItemIds: updatedSavedIds });

      // Return updated user profile
      const updatedUser = await userEntity.getState();
      const { password, ...userToReturn } = updatedUser;
      return ok(c, userToReturn);
    }

    const { password, ...userToReturn } = user;
    return ok(c, userToReturn);
  });

  app.get('/api/users/me/saved-items', authMiddleware, async (c) => {
    const payload = c.get('jwtPayload');
    const userId = payload.sub;

    const userEntity = new UserProfileEntity(c.env, userId);
    const user = await userEntity.getState();
    const savedIds = user.savedItemIds || [];

    const validItems: (AcademicWork & { authorName: string })[] = [];
    const validIds: string[] = [];
    let hasStaleData = false;

    for (const id of savedIds) {
      const item = await fetchAcademicWork(c.env, id);
      if (item) {
        validIds.push(id);

        // Fetch author name
        let authorName = 'Unknown';
        const authorId = item.lecturerId;
        if (authorId) {
          const authorProfile = await UserProfileEntity.get(c.env, authorId);
          if (authorProfile) {
            authorName = authorProfile.name;
          }
        }

        validItems.push({ ...item, authorName });
      } else {
        hasStaleData = true;
      }
    }

    // Self-correct: Update user's saved list if stale data was found
    if (hasStaleData) {
      await userEntity.patch({ savedItemIds: validIds });
    }

    return ok(c, validItems);
  });
}
