import { describe, it, expect } from 'vitest';
import request from 'supertest';

import { createApp } from './app.js';

describe('API abuse resistance', () => {
  it('lets users update allowed fields (positive control)', async () => {
    const res = await request(createApp()).patch('/me').send({ name: 'Robert' });
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Robert');
  });

  it('rejects mass assignment of role', async () => {
    const app = createApp();
    const res = await request(app).patch('/me').send({ name: 'Bob', role: 'admin' });
    expect(res.status).toBe(400);
  });

  it('rejects changing tenantId', async () => {
    const res = await request(createApp()).patch('/me').send({ tenantId: 't2' });
    expect(res.status).toBe(400);
  });

  it('does not return internal fields', async () => {
    const res = await request(createApp()).patch('/me').send({ name: 'Bob' });
    expect(res.body).not.toHaveProperty('role');
    expect(res.body).not.toHaveProperty('tenantId');
  });

  it('rejects wrong types', async () => {
    const res = await request(createApp()).patch('/me').send({ name: { $gt: '' } });
    expect(res.status).toBe(400);
  });

  it('rejects oversized bodies with 413', async () => {
    const res = await request(createApp()).patch('/me').send({ name: 'x'.repeat(50_000) });
    expect(res.status).toBe(413);
  });

  it('caps page size', async () => {
    const res = await request(createApp()).get('/items').query({ limit: 100000 });
    expect(res.status).toBe(400);
  });

  it('serves a normal page', async () => {
    const res = await request(createApp()).get('/items').query({ limit: 10 });
    expect(res.body).toHaveLength(10);
  });

  it('rate-limits the expensive endpoint', async () => {
    const app = createApp();
    const codes = [];
    for (let i = 0; i < 7; i++) codes.push((await request(app).post('/reports')).status);
    expect(codes.slice(0, 5).every((c) => c === 202)).toBe(true);
    expect(codes[6]).toBe(429);
  });
});
