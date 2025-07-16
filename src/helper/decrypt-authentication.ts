import bcrypt from 'bcrypt';
import crypto from 'crypto'

const algorithm = 'aes-256-ctr'
/**
 * Generates a JWT authentication token by hashing the provided password.
 * @param password - The password to be hashed.
 * @returns The hashed password.
 */
const jwtAuthentication = async(password: string) => {
    const salt = bcrypt.genSaltSync(10);
    const result = await bcrypt.hash(password, salt);
    return result;
}

/**
 * Decrypts the given value using the provided key.
 * @param key - The encryption key.
 * @param value - The value to decrypt.
 * @returns The decrypted value.
 */
const decrypt = (key: string, value: string) => {
    const textParts = value.split('.');
    const iv = Buffer.from(textParts.shift() || '', 'hex');
    const encryptedText = Buffer.from(textParts.join('.'), 'hex');
    const decipher = crypto.createDecipheriv(algorithm, Buffer.from(key, 'hex'), iv);

    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    return decrypted.toString();
}

/**
 * Encrypts a value using a given key.
 * @param key - The encryption key.
 * @param value - The value to be encrypted.
 * @returns The encrypted value.
 */
const encrypt = (key: string, value: string) => {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, Buffer.from(key, 'hex'), iv);
    let encrypted = cipher.update(value);

    encrypted = Buffer.concat([encrypted, cipher.final()]);

    return iv.toString('hex') + '.' + encrypted.toString('hex');
}

export { jwtAuthentication, decrypt, encrypt }