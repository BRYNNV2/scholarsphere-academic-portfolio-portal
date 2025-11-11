import { Hono } from "hono";
import { jwt, sign } from 'hono/jwt'
import { bearerAuth } from 'hono/bearer-auth'
import type { Env } from './core-utils';
import { LecturerProfileEntity, PublicationEntity, ResearchProjectEntity } from "./entities";
import { ok, bad, notFound } from './core-utils';
import type { LecturerProfile, Publication, ResearchProject } from "@shared/types";
type PublicationCreatePayload = Omit<Publication, 'id' | 'type' | 'lecturerId'> & { lecturerId: string };
type ProjectCreatePayload = Omit<ResearchProject, 'id' | 'type' | 'lecturerId'> & { lecturerId: string };
const JWT_SECRET = 'a-very-secret-key-that-should-be-in-env';
export function userRoutes(app: Hono<{ Bindings: Env }>) {
  // Ensure seed data on first request in a dev environment
  app.use('/api/*', async (c, next) => {
    await Promise.all([
      LecturerProfileEntity.ensureSeed(c.env),
      PublicationEntity.ensureSeed(c.env),
      ResearchProjectEntity.ensureSeed(c.env),
    ]);
    await next();
  });
  // --- AUTH ---
  const auth = new Hono<{ Bindings: Env }>();
  auth.post('/register', async (c) => {
    const body = await c.req.json<Omit<LecturerProfile, 'id'>>();
    if (!body.email || !body.password) {
      return bad(c, 'Email and password are required');
    }
    const lecturers = (await LecturerProfileEntity.list(c.env)).items;
    const existingUser = lecturers.find(l => l.email === body.email);
    if (existingUser) {
      return bad(c, 'User with this email already exists');
    }
    const newUser: LecturerProfile = {
      ...body,
      id: crypto.randomUUID(),
      publicationIds: [],
      projectIds: [],
      specializations: body.specializations || [],
      photoUrl: body.photoUrl || `https://i.pravatar.cc/300?u=${body.email}`,
    };
    await LecturerProfileEntity.create(c.env, newUser);
    // Don't return password
    const { password, ...userToReturn } = newUser;
    const token = await sign({ sub: userToReturn.id, role: 'user' }, JWT_SECRET);
    return ok(c, { user: userToReturn, token });
  });
  auth.post('/login', async (c) => {
    const { email, password } = await c.req.json();
    if (!email || !password) {
      return bad(c, 'Email and password are required');
    }
    const lecturers = (await LecturerProfileEntity.list(c.env)).items;
    const user = lecturers.find(l => l.email === email);
    if (!user || user.password !== password) {
      return c.json({ success: false, error: 'Invalid credentials' }, 401);
    }
    const { password: _, ...userToReturn } = user;
    const token = await sign({ sub: userToReturn.id, role: 'user' }, JWT_SECRET);
    return ok(c, { user: userToReturn, token });
  });
  app.route('/api/auth', auth);
  // --- SECURED ROUTES ---
  const secured = new Hono<{ Bindings: Env }>();
  secured.use('*', bearerAuth({ token: JWT_SECRET }));
  secured.put('/lecturers/:id', async (c) => {
    const { id } = c.req.param();
    const body = await c.req.json<Partial<LecturerProfile>>();
    const lecturer = new LecturerProfileEntity(c.env, id);
    if (!(await lecturer.exists())) return notFound(c, 'Lecturer not found');
    await lecturer.patch(body);
    return ok(c, await lecturer.getState());
  });
  secured.post('/publications', async (c) => {
    const body = await c.req.json<PublicationCreatePayload>();
    const { lecturerId, ...pubData } = body;
    if (!lecturerId) return bad(c, 'lecturerId is required');
    const lecturer = new LecturerProfileEntity(c.env, lecturerId);
    if (!(await lecturer.exists())) return notFound(c, 'Lecturer not found');
    const newPub: Publication = { ...pubData, id: crypto.randomUUID(), type: 'publication', lecturerId };
    await PublicationEntity.create(c.env, newPub);
    await lecturer.mutate(state => ({
      ...state,
      publicationIds: [...state.publicationIds, newPub.id],
    }));
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
    const lecturer = new LecturerProfileEntity(c.env, pub.lecturerId);
    if (await lecturer.exists()) {
      await lecturer.mutate(state => ({
        ...state,
        publicationIds: state.publicationIds.filter(pubId => pubId !== id),
      }));
    }
    const deleted = await PublicationEntity.delete(c.env, id);
    return ok(c, { id, deleted });
  });
  secured.post('/projects', async (c) => {
    const body = await c.req.json<ProjectCreatePayload>();
    const { lecturerId, ...projData } = body;
    if (!lecturerId) return bad(c, 'lecturerId is required');
    const lecturer = new LecturerProfileEntity(c.env, lecturerId);
    if (!(await lecturer.exists())) return notFound(c, 'Lecturer not found');
    const newProj: ResearchProject = { ...projData, id: crypto.randomUUID(), type: 'project', lecturerId };
    await ResearchProjectEntity.create(c.env, newProj);
    await lecturer.mutate(state => ({
      ...state,
      projectIds: [...state.projectIds, newProj.id],
    }));
    return ok(c, newProj);
  });
  secured.put('/projects/:id', async (c) => {
    const { id } = c.req.param();
    const body = await c.req.json<Partial<ResearchProject>>();
    const proj = new ResearchProjectEntity(c.env, id);
    if (!(await proj.exists())) return notFound(c, 'Project not found');
    await proj.patch(body);
    return ok(c, await proj.getState());
  });
  secured.delete('/projects/:id', async (c) => {
    const { id } = c.req.param();
    const projEntity = new ResearchProjectEntity(c.env, id);
    if (!(await projEntity.exists())) return notFound(c, 'Project not found');
    const proj = await projEntity.getState();
    const lecturer = new LecturerProfileEntity(c.env, proj.lecturerId);
    if (await lecturer.exists()) {
      await lecturer.mutate(state => ({
        ...state,
        projectIds: state.projectIds.filter(projId => projId !== id),
      }));
    }
    const deleted = await ResearchProjectEntity.delete(c.env, id);
    return ok(c, { id, deleted });
  });
  app.route('/api', secured);
  // --- PUBLIC ROUTES ---
  app.get('/api/lecturers', async (c) => {
    const page = await LecturerProfileEntity.list(c.env);
    // Omit password from public listing
    const lecturers = page.items.map(l => {
      const { password, ...rest } = l;
      return rest;
    });
    return ok(c, lecturers);
  });
  app.get('/api/lecturers/:id', async (c) => {
    const { id } = c.req.param();
    const lecturer = new LecturerProfileEntity(c.env, id);
    if (!(await lecturer.exists())) return notFound(c, 'Lecturer not found');
    const state = await lecturer.getState();
    // Omit password from public profile
    const { password, ...rest } = state;
    return ok(c, rest);
  });
  app.get('/api/publications', async (c) => {
    const page = await PublicationEntity.list(c.env);
    return ok(c, page.items);
  });
  app.get('/api/projects', async (c) => {
    const page = await ResearchProjectEntity.list(c.env);
    return ok(c, page.items);
  });
}