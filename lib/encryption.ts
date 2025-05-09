import crypto from "crypto"

// Required environment variable for encryption
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY
if (!ENCRYPTION_KEY) {
  console.error("ENCRYPTION_KEY environment variable is required. Run scripts/generate-encryption-key.js to create one.")
  throw new Error("Missing ENCRYPTION_KEY environment variable")
}
const IV_LENGTH = 16

export function encrypt(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH)
  const cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(ENCRYPTION_KEY as string), iv)
  let encrypted = cipher.update(text, "utf8", "hex")
  encrypted += cipher.final("hex")
  return `${iv.toString("hex")}:${encrypted}`
}

export function decrypt(text: string): string {
  const [ivHex, encryptedHex] = text.split(":")
  const iv = Buffer.from(ivHex, "hex")
  const decipher = crypto.createDecipheriv("aes-256-cbc", Buffer.from(ENCRYPTION_KEY as string), iv)
  let decrypted = decipher.update(encryptedHex, "hex", "utf8")
  decrypted += decipher.final("utf8")
  return decrypted
}
