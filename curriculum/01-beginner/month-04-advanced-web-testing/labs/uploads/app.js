import express from 'express';
import multer from 'multer';
import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';

// Identify files by their content ("magic bytes"), never by the client's filename or Content-Type.
const SIGNATURES = [
  { ext: 'png', mime: 'image/png', bytes: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a] },
  { ext: 'jpg', mime: 'image/jpeg', bytes: [0xff, 0xd8, 0xff] },
];
const sniff = (buf) => SIGNATURES.find((s) => s.bytes.every((b, i) => buf[i] === b));
const STORED_NAME = /^[0-9a-f-]{36}\.(png|jpg)$/;

export function createApp({ storageDir }) {
  const root = path.resolve(storageDir);                  // outside any public/static directory
  const app = express();
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 1024 * 1024, files: 1, fields: 5 },   // 1 MB, one file
  });

  app.post('/avatars', upload.single('file'), async (req, res, next) => {
    try {
      if (!req.file) return res.status(400).json({ error: 'No file' });
      const type = sniff(req.file.buffer);
      if (!type) return res.status(415).json({ error: 'Only PNG or JPEG images are allowed' });
      const name = `${crypto.randomUUID()}.${type.ext}`;  // server-chosen name; original name discarded
      await fs.mkdir(root, { recursive: true });
      await fs.writeFile(path.join(root, name), req.file.buffer, { mode: 0o640 });
      res.status(201).json({ id: name });
    } catch (e) { next(e); }
  });

  app.get('/avatars/:id', async (req, res) => {
    const { id } = req.params;
    if (!STORED_NAME.test(id)) return res.status(404).end();          // strict format check first
    const file = path.resolve(root, id);
    if (path.dirname(file) !== root) return res.status(404).end();     // belt and braces: must stay in root
    try {
      const data = await fs.readFile(file);
      res.set({
        'Content-Type': id.endsWith('.png') ? 'image/png' : 'image/jpeg',
        'X-Content-Type-Options': 'nosniff',
        'Content-Disposition': 'inline; filename="avatar"',
        'Content-Security-Policy': "default-src 'none'; sandbox",
      }).send(data);
    } catch { res.status(404).end(); }
  });

  app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
      return res.status(err.code === 'LIMIT_FILE_SIZE' ? 413 : 400).json({ error: 'Upload rejected' });
    }
    res.status(500).json({ error: 'Internal error' });
  });
  return app;
}
