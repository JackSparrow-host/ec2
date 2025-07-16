import express from 'express';

import userController from '../controllers/user.controller';
import { isAdminAuthenticated, isAuthenticated, isUserAuthenticatedVerified } from '../middleware/authentication.middleware';

/**
 * Express router for handling user-related routes.
 * @class
 */
const userRouter = express.Router();

/**
 * Route for getting all users.
 * @name GET /
 * @function
 * @memberof userRouter
 * @param {Function} isAuthenticated - Middleware function for authentication.
 * @param {Function} isUserAuthenticatedVerified - Middleware for authenticating verified user.
 * @param {Function} userController.getUsers - Controller function for getting all users.
 */
userRouter.get('/', isAuthenticated, isAdminAuthenticated, isUserAuthenticatedVerified, userController.getUsers);

/**
 * Route for getting a user by ID.
 * @name GET /:id
 * @function
 * @memberof userRouter
 * @param {Function} isAuthenticated - Middleware function for authentication.
 * @param {Function} isUserAuthenticatedVerified - Middleware for authenticating verified user.
 * @param {Function} userController.getUser - Controller function for getting a user by ID.
 */
userRouter.get('/:id', isAuthenticated, isAdminAuthenticated, isUserAuthenticatedVerified, userController.getUser);

/**
 * Route for updating a user by ID.
 * @name PUT /:id
 * @function
 * @memberof userRouter
 * @param {Function} isAuthenticated - Middleware function for authentication.
 * @param {Function} isAdminAuthenticated - Middleware function for admin authentication.
 * @param {Function} isUserAuthenticatedVerified - Middleware for authenticating verified user.
 * @param {Function} userController.updateUser - Controller function for updating a user by ID.
 */
userRouter.put('/:id', isAuthenticated, isAdminAuthenticated, isUserAuthenticatedVerified, userController.updateUser);

/**
 * Route for deleting a user by ID.
 * @name DELETE /:id
 * @function
 * @memberof userRouter
 * @param {Function} isAuthenticated - Middleware function for authentication.
 * @param {Function} isUserAuthenticatedVerified - Middleware for authenticating verified user.
 * @param {Function} userController.deleteUser - Controller function for deleting a user by ID.
 */
userRouter.delete('/:id', isAuthenticated, isAdminAuthenticated, isUserAuthenticatedVerified, userController.deleteUser);

/**
 * Route for toggling dark mode for a user.
 * @name POST /:id/darkMode
 * @function
 * @memberof userRouter
 * @param {Function} userController.toggleDarkMode - Controller function for toggling dark mode.
 */
userRouter.post('/:id/darkMode', userController.toggleDarkMode);

export default userRouter;