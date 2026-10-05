import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
// In a real implementation, this key would be securely loaded from a Key Management Service (KMS) or environment variable.
const SECRET_KEY = crypto.scryptSync('dummy-kms-secret-key-do-not-use-in-prod', 'salt', 32);

export interface EncryptedData {
  iv: string;
  authTag: string;
  data: string;
}

/**
 * Encrypts sensitive provider credentials before they are stored in the database.
 */
export function encryptProviderCredentials(credentials: string): EncryptedData {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, SECRET_KEY, iv);
  
  let encrypted = cipher.update(credentials, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');
  
  return {
    iv: iv.toString('hex'),
    authTag,
    data: encrypted
  };
}

/**
 * Decrypts sensitive provider credentials when they are needed for synchronization.
 */
export function decryptProviderCredentials(encryptedData: EncryptedData): string {
  const decipher = crypto.createDecipheriv(ALGORITHM, SECRET_KEY, Buffer.from(encryptedData.iv, 'hex'));
  decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));
  
  let decrypted = decipher.update(encryptedData.data, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}
