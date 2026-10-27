import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createApp } from './app.js';

const PNG = Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), Buffer.alloc(64)]);
let dir, app;
beforeEach(() => {
  const base = fs.mkdtempSync(path.join(os.tmpdir(), 'uploads-'));
  fs.writeFileSync(path.join(base, 'secret.txt'), 'DB_PASSWORD=lab-only');   // a file just outside storage
  dir = path.join(base, 'store');
  app = createApp({ storageDir: dir });
});

describe('file upload handling', () => {
  it('accepts a real PNG and stores it under a random name (positive control)', async () => {
    const res = await request(app).post('/avatars').attach('file', PNG, 'me.png');
    expect(res.status).toBe(201);
    expect(res.body.id).toMatch(/^[0-9a-f-]{36}\.png$/);
    expect(fs.readdirSync(dir)).toEqual([res.body.id]);
  });

  it('ignores the client filename entirely', async () => {
    const res = await request(app).post('/avatars').attach('file', PNG, '../../evil.png');
    expect(res.status).toBe(201);
    expect(fs.readdirSync(dir)).toEqual([res.body.id]);         // nothing written outside, name not reused
  });

  it('rejects HTML disguised with an image extension and Content-Type', async () => {
    const res = await request(app).post('/avatars')
      .attach('file', Buffer.from('<html><script>alert(1)</script></html>'), { filename: 'cat.png', contentType: 'image/png' });
    expect(res.status).toBe(415);
    expect(fs.existsSync(dir) ? fs.readdirSync(dir) : []).toHaveLength(0);
  });

  it('rejects files over 1 MB with 413', async () => {
    const big = Buffer.concat([PNG, Buffer.alloc(1024 * 1024)]);
    const res = await request(app).post('/avatars').attach('file', big, 'big.png');
    expect(res.status).toBe(413);
  });

  it('serves stored files with safe headers', async () => {
    const { body } = await request(app).post('/avatars').attach('file', PNG, 'me.png');
    const res = await request(app).get(`/avatars/${body.id}`);
    expect(res.status).toBe(200);
    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['content-type']).toBe('image/png');
  });

  it.each([
    '..%2Fsecret.txt',
    '..%2F..%2Fetc%2Fpasswd',
    'not-a-stored-name.png',
  ])('refuses to serve %s', async (id) => {
    const res = await request(app).get(`/avatars/${id}`);
    expect(res.status).toBe(404);
    expect(res.text ?? '').not.toContain('DB_PASSWORD');
  });
});
