import nodemailer from 'nodemailer';

import config from '../config/config';
import { decrypt } from '../helper/decrypt-authentication';

let transporterConfig = getValuesFromEncryptedConfig();

/**
 * Retrieves the values for the mailer configuration from the encrypted config.
 * @returns An object containing the host, port, user, pass, and secure values.
 */
function getValuesFromEncryptedConfig() {
    const decrypted = decrypt(config.secrets.phrase, config.secrets.mailSecret);
    const { host, port, user, pass, secure } = JSON.parse(decrypted);
    return { host, port, user, pass, secure };
}

/**
 * Nodemailer transporter object.
 */
const transporter = nodemailer.createTransport({
    host: transporterConfig.host,
    port: transporterConfig.port,
    secure: transporterConfig.secure,
    auth: {
        user: transporterConfig.user,
        pass: transporterConfig.pass
    }
});

transporter.verify((error, success) => {
    if (error) {
        console.log(error);
    } else {
        console.log('Server is ready to take our messages');
    }
});

export default transporter;
