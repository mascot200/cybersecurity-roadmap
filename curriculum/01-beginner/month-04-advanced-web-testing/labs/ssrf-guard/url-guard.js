import dns from 'node:dns/promises';
import net from 'node:net';

// Addresses a server-side fetch must never reach: loopback, private networks,
// link-local (includes cloud metadata 169.254.169.254), carrier-grade NAT, and IPv6 equivalents.
const blocked = new net.BlockList();
for (const [addr, prefix] of [
  ['0.0.0.0', 8], ['10.0.0.0', 8], ['100.64.0.0', 10], ['127.0.0.0', 8],
  ['169.254.0.0', 16], ['172.16.0.0', 12], ['192.168.0.0', 16], ['224.0.0.0', 4], ['240.0.0.0', 4],
]) blocked.addSubnet(addr, prefix, 'ipv4');
for (const [addr, prefix] of [['::', 128], ['::1', 128], ['fc00::', 7], ['fe80::', 10], ['ff00::', 8]]) {
  blocked.addSubnet(addr, prefix, 'ipv6');
}

export function isBlockedAddress(address) {
  // IPv4-mapped IPv6 (::ffff:127.0.0.1) must be checked as IPv4.
  const mapped = /^::ffff:(\d+\.\d+\.\d+\.\d+)$/i.exec(address);
  if (mapped) return blocked.check(mapped[1], 'ipv4');
  const family = net.isIP(address);
  if (family === 0) return true;                        // not an IP: refuse
  return blocked.check(address, family === 4 ? 'ipv4' : 'ipv6');
}

export class UnsafeUrlError extends Error {}

/**
 * Validate a user-supplied URL before the server fetches it.
 * Returns { url, address } — connect to `address` (pin it) so DNS can't change between check and use.
 */
export async function assertSafeUrl(input, { allowedHosts, lookup = dns.lookup } = {}) {
  let url;
  try { url = new URL(input); } catch { throw new UnsafeUrlError('Invalid URL'); }

  if (url.protocol !== 'https:') throw new UnsafeUrlError('Only https is allowed');
  if (url.username || url.password) throw new UnsafeUrlError('Credentials in URL are not allowed');
  if (url.port && url.port !== '443') throw new UnsafeUrlError('Non-standard port');
  if (!allowedHosts?.has(url.hostname)) throw new UnsafeUrlError('Host not allowed');

  const results = await lookup(url.hostname, { all: true });
  if (results.length === 0 || results.some((r) => isBlockedAddress(r.address))) {
    throw new UnsafeUrlError('Host resolves to a blocked address');
  }
  return { url, address: results[0].address };
}
