import { jwtVerify } from 'jose';

// Everything the verifier trusts is configuration, never the token itself.
export function createVerifier({ publicKey, issuer, audience }) {
  return async function verifyAccessToken(token) {
    const { payload } = await jwtVerify(token, publicKey, {
      issuer,                       // who must have issued it
      audience,                     // which API it is for
      algorithms: ['ES256'],        // pin the algorithm: no "none", no HS256 confusion
      requiredClaims: ['exp', 'sub'],
      clockTolerance: 5,            // seconds of allowed clock skew
    });
    return payload;
  };
}
