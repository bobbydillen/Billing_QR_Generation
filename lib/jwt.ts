import { SignJWT, jwtVerify } from "jose"

const JWT_SECRET = process.env.JWT_SECRET || "bobby2005"

export async function signJWT(payload: any) {
  try {
    const secretKey = new TextEncoder().encode(JWT_SECRET)

    const token = await new SignJWT(payload)
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("1y") // Token valid for 1 year
      .sign(secretKey)

    return token
  } catch (error) {
    console.error("JWT signing failed:", error)
    // Return a fallback token for development
    return "invalid-jwt-token-" + Date.now()
  }
}

export async function verifyJWT(token: string) {
  try {
    const secretKey = new TextEncoder().encode(JWT_SECRET)
    const { payload } = await jwtVerify(token, secretKey)
    return payload
  } catch (error) {
    console.error("JWT verification failed:", error)
    return null
  }
}

