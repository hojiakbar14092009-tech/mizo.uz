import { SignJWT, jwtVerify, type JWTPayload } from 'jose'

// Keep the fallback compatible with the existing proxy.ts.
const secret = new TextEncoder().encode(
  process.env.JWT_SECRET ?? 'mizo-super-secret-key-change-in-production'
)

export async function sign(payload: JWTPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(secret)
}

export async function verify(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret, { algorithms: ['HS256'] })
    return payload
  } catch {
    return null
  }
}
