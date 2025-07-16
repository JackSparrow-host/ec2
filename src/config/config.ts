import dotenv from 'dotenv';
import path from 'path';

let pathToEnv;
switch (process.env.NODE_ENV) {
    case "development":
        pathToEnv = path.resolve(process.cwd(), './.env.dev');
        break;
    case "production":
        pathToEnv = path.resolve(process.cwd(), './.env.prod');
        break;
    default:
        pathToEnv = path.resolve(process.cwd(), './.env.prod');
}
dotenv.config({ path: pathToEnv, override: true });

const PORT = process.env.PORT || '';
const SERVER_HOSTNAME = process.env.SERVER_HOSTNAME || '';
const MONGO_URL = process.env.MONGO_URL || '';
const JWT_SECRET = process.env.JWT_SECRET || '';
const PHRASE = process.env.PHRASE || '';
const MAIL_SECRET = process.env.MAIL_SECRET || '';
const SMTP_SENDER = process.env.SMTP_SENDER || '';
const SMTP_PORT = process.env.SMTP_PORT || '';
const SMTP_HOST = process.env.SMTP_HOST || '';
const BUCKET_NAME = process.env.BUCKET_NAME || '';
const DEFAULT_REGION = process.env.DEFAULT_REGION || '';
const DEFAULT_FILES_ACL = process.env.DEFAULT_FILES_ACL || '';
const AWS_SECRET = process.env.AWS_SECRET || '';
const COOKIE_KEY = process.env.COOKIE_KEY || '';
const GOOGLE_REDIRECT_URL = process.env.GOOGLE_REDIRECT_URL || '';
const GOOGLE_SECRET = process.env.GOOGLE_SECRET || '';
const GOOGLE_ID = process.env.GOOGLE_ID || '';

/**
 * Configuration object for the application.
 */
const APP = {
    port: PORT,
    serverHost: SERVER_HOSTNAME,
    mongoUrl: MONGO_URL
}

/**
 * Configuration object for secrets.
 */
const SECRETS = {
    jwtSecret: JWT_SECRET,
    mailSecret: MAIL_SECRET,
    phrase: PHRASE,
}

/**
 * SMTP configuration object.
 */
const SMTP = {
    sender: SMTP_SENDER,
    port: SMTP_PORT,
    host: SMTP_HOST
}

/**
 * Configuration object for S3 bucket.
 */
const S3_BUCKET = {
    bucketName: BUCKET_NAME,
    defaultRegion: DEFAULT_REGION,
    defaultFilesACL: DEFAULT_FILES_ACL,
    awsSecret: AWS_SECRET,
}

/**
 * Configuration object for Google API.
 */
const GOOGLE = {
    key: COOKIE_KEY,
    redirectURL: GOOGLE_REDIRECT_URL,
    secret: GOOGLE_SECRET,
    google_Id: GOOGLE_ID
}

/**
 * Configuration object for the application.
 */
const config = {
    app: APP,
    secrets: SECRETS,
    smtp: SMTP,
    drive: S3_BUCKET,
    google: GOOGLE
};

export default config;