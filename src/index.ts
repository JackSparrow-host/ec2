import express from 'express';
import session from 'express-session';
import bodyParser from 'body-parser';
import cors from 'cors';
import compression from 'compression';
import mongoose from 'mongoose';
import passport from 'passport';
import http from 'http';
import cookieParser from 'cookie-parser';

import config from './config/config';
import authRoutes from './routes/authentication.route';
import projectRouter from './routes/project.route';
import logger from './config/logging';
import fileHandlerRouter from './routes/file-handler.router';
import userRouter from './routes/user.router';
import { decrypt } from './helper/decrypt-authentication';

const NAMESPACE = 'EnergyQC Server';
const databaseUrl = decrypt(config.secrets.phrase, config.app.mongoUrl);

require('./strategies/google');

const app = express();
app.use(cors({credentials: true}));
app.use(compression());
app.use(cookieParser());
app.use(bodyParser.json());

const httpServer = http.createServer(app);

httpServer.listen(config.app.port, () => {
    if (config.app.serverHost === 'localhost') {
        logger.info(`Server running on http://localhost:${config.app.port}`, { label: NAMESPACE });
    } else {
        logger.info(`Server running on ${config.app.serverHost}`, { label: NAMESPACE });
    }
});

app.use((req, res, next) => {
    logger.info(`METHOD - [${req.method}], URL - [${req.url}], IP - [${req.socket.remoteAddress}]`, { label: NAMESPACE });

    res.on('finish', () => {
        logger.info(`METHOD - [${req.method}], URL - [${req.url}], IP - [${req.socket.remoteAddress}], STATUS - [${res.statusCode}]`, { label: NAMESPACE });
    });

    next();
});

mongoose.Promise = Promise;
mongoose.connect(databaseUrl).then(() => {
    logger.info('MongoDB connected.', { label: NAMESPACE });
}).catch((error) => {
    logger.error(`Data error connection: ${error}`, { label: NAMESPACE });
});

/** Rules of our API */
/** logger the request */
app.use((req, res, next) => {
    logger.info(`METHOD - [${req.method}], URL - [${req.url}], IP - [${req.socket.remoteAddress}]`, { label: NAMESPACE });

    res.on('finish', () => {
        logger.info(`METHOD - [${req.method}], URL - [${req.url}], IP - [${req.socket.remoteAddress}], STATUS - [${res.statusCode}]`, { label: NAMESPACE });
    });

    next();
});

/** Rules of our API */
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'GET PATCH DELETE POST PUT');
        return res.status(200).json({});
    }

    next();
});

app.use('/auth', authRoutes);
app.use('/projects', projectRouter);
app.use('/files', fileHandlerRouter);
app.use('/users', userRouter);
