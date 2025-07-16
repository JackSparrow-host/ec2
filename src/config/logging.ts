import winston from 'winston';
import { MongoDBTransportInstance } from "winston-mongodb";

import config from '../config/config';
import { decrypt } from '../helper/decrypt-authentication';

const { MongoDB }: { MongoDB: MongoDBTransportInstance } = require("winston-mongodb");
const databaseUrl = decrypt(config.secrets.phrase, config.app.mongoUrl);

/**
 * The logger instance for logging application events.
 */
const logger = winston.createLogger(
    {
        level: 'info',
        format: winston.format.combine(
            winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
            winston.format.printf((info) => `${info.timestamp} - [${info.label}] - ${info.level}: ${info.message}`)
        ),
        transports: [
            new winston.transports.Console(), 
            new winston.transports.MongoDB({
                db: databaseUrl,
                options: { useNewUrlParser: true, useUnifiedTopology: true },
                collection: 'logs',
            }),
        ]
    }
);

export default logger;
