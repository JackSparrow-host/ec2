/**
 * Express router for authentication routes.
 * @module routes/authentication
 */

import express from 'express';
import passport from 'passport';

import authenticationController from '../controllers/authentication.controller';
import { isAuthenticated } from '../middleware/authentication.middleware';

const router = express.Router();

/**
 * Route for initiating Google authentication.
 * @name GET /google
 * @function
 * @memberof module:routes/authentication
 * @param {string} path - The URL path.
 * @param {function} middleware - Passport authentication middleware.
 * @param {function} controller - Controller function for handling the authentication.
 */
router.get('/google', passport.authenticate('google'), authenticationController.googleLogin);

/**
 * Route for handling the Google authentication redirect.
 * @name GET /google/redirect
 * @function
 * @memberof module:routes/authentication
 * @param {string} path - The URL path.
 * @param {function} middleware - Passport authentication middleware.
 * @param {object} options - Options for passport.authenticate.
 * @param {string} options.failureRedirect - The URL to redirect to in case of authentication failure.
 * @param {string} options.successRedirect - The URL to redirect to in case of authentication success.
 */
router.get('/google/redirect', passport.authenticate('google', {
    failureRedirect: '/auth/google/failure',
    successRedirect: '/auth/success'    
}));

/**
 * Route for successful authentication.
 * @name GET /success
 * @function
 * @memberof module:routes/authentication
 * @param {string} path - The URL path.
 * @param {function} middleware - Middleware function for checking if user is authenticated.
 * @param {function} controller - Controller function for handling the successful authentication.
 */
router.get('/success', isAuthenticated,  authenticationController.successLogIn);

/**
 * Route for failed Google authentication.
 * @name GET /google/failure
 * @function
 * @memberof module:routes/authentication
 * @param {string} path - The URL path.
 * @param {function} controller - Controller function for handling the failed authentication.
 */
router.get('/google/failure', authenticationController.failureLogIn);

/**
 * Route for user login.
 * @name POST /login
 * @function
 * @memberof module:routes/authentication
 * @param {string} path - The URL path.
 * @param {function} controller - Controller function for handling the login request.
 */
router.post('/login', authenticationController.login);

/**
 * Route for user logout.
 * @name GET /logout
 * @function
 * @memberof module:routes/authentication
 * @param {string} path - The URL path.
 * @param {function} middleware - Middleware function for checking if user is authenticated.
 * @param {function} controller - Controller function for handling the logout request.
 */
router.get('/logout', isAuthenticated, authenticationController.logout);

export default router;