/**
 * Express router for handling file-related routes.
 * @module fileHandlerRouter
 */

import express from 'express';

import FilesHandlerController from '../controllers/file-handler.controller';
import { isAuthenticated, isUserAuthenticatedVerified } from '../middleware/authentication.middleware';
import fileUploadMiddleware from '../middleware/file-uploader.middleware';

const fileHandlerRouter = express.Router();

/**
 * Route for uploading files.
 * @name POST /upload
 * @function
 * @memberof module:fileHandlerRouter
 * @param {Function} isAuthenticated - Middleware for authenticating user.
 * @param {Function} isUserAuthenticatedVerified - Middleware for authenticating verified user.
 * @param {Function} fileUploadMiddleware - Middleware for handling file uploads.
 * @param {Function} FilesHandlerController.filesUpload - Controller function for handling file uploads.
 */
fileHandlerRouter.post(
    '/upload',
    isAuthenticated,
    isUserAuthenticatedVerified,
    fileUploadMiddleware,
    FilesHandlerController.filesUpload
);

/**
 * Route for replacing a file.
 * @name POST /replace/:id
 * @function
 * @memberof module:fileHandlerRouter
 * @param {Function} isAuthenticated - Middleware for authenticating user.
 * @param {Function} isUserAuthenticatedVerified - Middleware for authenticating verified user.
 * @param {Function} fileUploadMiddleware - Middleware for handling file uploads.
 * @param {Function} FilesHandlerController.replaceFile - Controller function for replacing a file.
 */
fileHandlerRouter.post('/replace/:id', isAuthenticated, isUserAuthenticatedVerified, fileUploadMiddleware,
                       FilesHandlerController.replaceFile);

/**
 * Route for downloading a file.
 * @name GET /:id
 * @function
 * @memberof module:fileHandlerRouter
 * @param {Function} isAuthenticated - Middleware for authenticating user.
 * @param {Function} isUserAuthenticatedVerified - Middleware for authenticating verified user.
 * @param {Function} FilesHandlerController.downloadFile - Controller function for downloading a file.
 */
fileHandlerRouter.get('/:id', isAuthenticated, isUserAuthenticatedVerified, FilesHandlerController.downloadFile);

/**
 * Route for downloading xlsx a file.
 * @name GET /:id
 * @function
 * @memberof module:fileHandlerRouter
 * @param {Function} isAuthenticated - Middleware for authenticating user.
 * @param {Function} isUserAuthenticatedVerified - Middleware for authenticating verified user.
 * @param {Function} FilesHandlerController.getSignedUrlForDownload - Controller function for downloading a file.
 */
fileHandlerRouter.get('/signed-url/:id', isAuthenticated, isUserAuthenticatedVerified, FilesHandlerController.getSignedUrlForDownload);

export default fileHandlerRouter;