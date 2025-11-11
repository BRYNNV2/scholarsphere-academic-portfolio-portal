import { Hono } from "hono";
import type { Env } from './core-utils';
import { LecturerProfileEntity, PublicationEntity, ResearchProjectEntity } from "./entities";
import { ok, bad, notFound, isStr } from './core-utils';
import type { LecturerProfile, Publication, ResearchProject } from "@shared/types";
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
  // --- LECTURERS ---
  app.get('/api/lecturers', async (c) => {
    const page = await LecturerProfileEntity.list(c.env);
    return ok(c, page.items);
  });
  app.get('/api/lecturers/:id', async (c) => {
    const { id } = c.req.param();
    const lecturer = new LecturerProfileEntity(c.env, id);
    if (!(await lecturer.exists())) return notFound(c, 'Lecturer not found');
    return ok(c, await lecturer.getState());
  });
  app.put('/api/lecturers/:id', async (c) => {
    const { id } = c.req.param();
    const body = await c.req.json<Partial<LecturerProfile>>();
    const lecturer = new LecturerProfileEntity(c.env, id);
    if (!(await lecturer.exists())) return notFound(c, 'Lecturer not found');
    await lecturer.patch(body);
    return ok(c, await lecturer.getState());
  });
  // --- PUBLICATIONS ---
  app.get('/api/publications', async (c) => {
    const page = await PublicationEntity.list(c.env);
    return ok(c, page.items);
  });
  app.post('/api/publications', async (c) => {
    const body = await c.req.json<Omit<Publication, 'id'>>();
    const newPub = { ...body, id: crypto.randomUUID() };
    await PublicationEntity.create(c.env, newPub);
    return ok(c, newPub);
  });
  app.put('/api/publications/:id', async (c) => {
    const { id } = c.req.param();
    const body = await c.req.json<Partial<Publication>>();
    const pub = new PublicationEntity(c.env, id);
    if (!(await pub.exists())) return notFound(c, 'Publication not found');
    await pub.patch(body);
    return ok(c, await pub.getState());
  });
  app.delete('/api/publications/:id', async (c) => {
    const { id } = c.req.param();
    const deleted = await PublicationEntity.delete(c.env, id);
    return ok(c, { id, deleted });
  });
  // --- RESEARCH PROJECTS ---
  app.get('/api/projects', async (c) => {
    const page = await ResearchProjectEntity.list(c.env);
    return ok(c, page.items);
  });
  app.post('/api/projects', async (c) => {
    const body = await c.req.json<Omit<ResearchProject, 'id'>>();
    const newProj = { ...body, id: crypto.randomUUID() };
    await ResearchProjectEntity.create(c.env, newProj);
    return ok(c, newProj);
  });
  app.put('/api/projects/:id', async (c) => {
    const { id } = c.req.param();
    const body = await c.req.json<Partial<ResearchProject>>();
    const proj = new ResearchProjectEntity(c.env, id);
    if (!(await proj.exists())) return notFound(c, 'Project not found');
    await proj.patch(body);
    return ok(c, await proj.getState());
  });
  app.delete('/api/projects/:id', async (c) => {
    const { id } = c.req.param();
    const deleted = await ResearchProjectEntity.delete(c.env, id);
    return ok(c, { id, deleted });
  });
}