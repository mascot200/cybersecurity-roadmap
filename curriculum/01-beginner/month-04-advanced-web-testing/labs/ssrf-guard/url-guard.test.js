import { describe, it, expect } from 'vitest';
import { assertSafeUrl, isBlockedAddress, UnsafeUrlError } from './url-guard.js';

// Fake DNS so tests are deterministic and need no network.
const DNS = {
  'images.example.com': ['93.184.215.14'],
  'rebind.example.com': ['93.184.215.14', '127.0.0.1'],    // one public, one internal answer
  'meta.example.com': ['169.254.169.254'],
  'v6local.example.com': ['::1'],
  'mapped.example.com': ['::ffff:10.0.0.5'],
};
const lookup = async (host) => (DNS[host] ?? []).map((address) => ({ address, family: address.includes(':') ? 6 : 4 }));
const allowedHosts = new Set(Object.keys(DNS));
const check = (u) => assertSafeUrl(u, { allowedHosts, lookup });

describe('assertSafeUrl', () => {
  it('allows an allowlisted https host with a public address (positive control)', async () => {
    const { address } = await check('https://images.example.com/cat.png');
    expect(address).toBe('93.184.215.14');
  });

  it.each([
    ['plain http', 'http://images.example.com/a.png'],
    ['file scheme', 'file:///etc/passwd'],
    ['host not on allowlist', 'https://other.example.org/a.png'],
    ['credentials in URL', 'https://user:pw@images.example.com/'],
    ['non-standard port', 'https://images.example.com:8443/'],
    ['metadata address via DNS', 'https://meta.example.com/latest/'],
    ['any internal answer among several', 'https://rebind.example.com/'],
    ['IPv6 loopback via DNS', 'https://v6local.example.com/'],
    ['IPv4-mapped IPv6 private address', 'https://mapped.example.com/'],
    ['literal metadata IP', 'https://169.254.169.254/'],
    ['decimal-encoded loopback', 'https://2130706433/'],
    ['not a URL', 'not a url'],
  ])('rejects %s', async (_name, u) => {
    await expect(check(u)).rejects.toBeInstanceOf(UnsafeUrlError);
  });
});

describe('isBlockedAddress', () => {
  it.each(['127.0.0.1', '10.1.2.3', '172.16.0.1', '192.168.1.1', '169.254.169.254', '100.64.0.1', '0.0.0.0', '::1', 'fe80::1', 'fd00::1', '::ffff:192.168.0.1'])(
    'blocks %s', (a) => expect(isBlockedAddress(a)).toBe(true));
  it.each(['93.184.215.14', '8.8.8.8', '2606:4700:4700::1111'])(
    'allows %s', (a) => expect(isBlockedAddress(a)).toBe(false));
});
