import { decrypt } from '../helper/decrypt-authentication';
import config from '../config/config';

/**
 * Retrieves the client ID and client secret from the encrypted config.
 * @returns An object containing the client ID and client secret.
 */
function getValuesFromEncryptedConfig() {
    const decrypted = decrypt(config.secrets.phrase, config.drive.awsSecret);
    const { clientId, clientSecret } = JSON.parse(decrypted);
    return { clientId, clientSecret };
}

export default getValuesFromEncryptedConfig;