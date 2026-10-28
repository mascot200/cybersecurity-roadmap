import { describe, it, expect, beforeAll } from 'vitest';
import { SignJWT, generateKeyPair } from 'jose';
import { createVerifier } from './verify.js';

const ISS = 'https://auth.lab.local';
const AUD = 'invoices-api';
let verify, privateKey, publicKey, otherKey;

beforeAll(async () => {
  ({ privateKey, publicKey } = await generateKeyPair('ES256'));
  ({ privateKey: otherKey } = await generateKeyPair('ES256'));
  verify = createVerifier({ publicKey, issuer: ISS, audience: AUD });
});

const sign = (claims = {}, { key = privateKey, exp = '5m', iss = ISS, aud = AUD } = {}) => {
  const jwt = new SignJWT({ role: 'member', ...claims }).setProtectedHeader({ alg: 'ES256' })
    .setSubject('user-123').setIssuedAt();
  if (iss) jwt.setIssuer(iss);
  if (aud) jwt.setAudience(aud);
  if (exp) jwt.setExpirationTime(exp);
  return jwt.sign(key);
};
const b64 = (o) => Buffer.from(JSON.stringify(o)).toString('base64url');

describe('JWT verification', () => {
  it('accepts a valid token (positive control)', async () => {
    expect((await verify(await sign())).sub).toBe('user-123');
  });

  it('rejects an expired token', async () => {
    await expect(verify(await sign({}, { exp: Math.floor(Date.now() / 1000) - 60 }))).rejects.toThrow();
  });

  it('rejects a token signed by a different key', async () => {
    await expect(verify(await sign({}, { key: otherKey }))).rejects.toThrow();
  });

  it('rejects a tampered payload (role escalated after signing)', async () => {
    const [h, , s] = (await sign()).split('.');
    const forged = `${h}.${b64({ sub: 'user-123', role: 'admin', iss: ISS, aud: AUD, exp: 9999999999 })}.${s}`;
    await expect(verify(forged)).rejects.toThrow();
  });

  it('rejects alg "none"', async () => {
    const forged = `${b64({ alg: 'none', typ: 'JWT' })}.${b64({ sub: 'user-123', role: 'admin', iss: ISS, aud: AUD, exp: 9999999999 })}.`;
    await expect(verify(forged)).rejects.toThrow();
  });

  it('rejects a token for another audience', async () => {
    await expect(verify(await sign({}, { aud: 'billing-api' }))).rejects.toThrow();
  });

  it('rejects a token from another issuer', async () => {
    await expect(verify(await sign({}, { iss: 'https://evil.example' }))).rejects.toThrow();
  });

  it('rejects a token with no expiry', async () => {
    await expect(verify(await sign({}, { exp: null }))).rejects.toThrow();
  });

  it('rejects malformed input', async () => {
    await expect(verify('not.a.jwt')).rejects.toThrow();
  });
});
