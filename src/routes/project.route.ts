/**
 * Express router for handling project-related routes.
 * @module routes/project.route
 */

import express from 'express';

import projectController from '../controllers/project.controller';
import { isAuthenticated, isUserAuthenticatedVerified } from '../middleware/authentication.middleware';

const projectRouter = express.Router();

/**
 * Route for getting all projects.
 * @name GET /projects
 * @function
 * @memberof module:routes/project.route
 * @inner
 * @param {Function} isAuthenticated - Middleware function for authentication.
 * @param {Function} isUserAuthenticatedVerified - Middleware for authenticating verified user.
 * @param {Function} projectController.getProjects - Controller function for getting projects.
 */
projectRouter.get('/', isAuthenticated, isUserAuthenticatedVerified, projectController.getProjects);

/**
 * Route for getting a specific project by ID.
 * @name GET /projects/:id
 * @function
 * @memberof module:routes/project.route
 * @inner
 * @param {Function} isAuthenticated - Middleware function for authentication.
 * @param {Function} isUserAuthenticatedVerified - Middleware for authenticating verified user.
 * @param {Function} projectController.getProject - Controller function for getting a project.
 */
projectRouter.get('/:id', isAuthenticated, isUserAuthenticatedVerified, projectController.getProject);

/**
 * Route for adding a new project.
 * @name POST /projects
 * @function
 * @memberof module:routes/project.route
 * @inner
 * @param {Function} isAuthenticated - Middleware function for authentication.
 * @param {Function} isUserAuthenticatedVerified - Middleware for authenticating verified user.
 * @param {Function} projectController.addProjectData - Controller function for adding a project.
 */
projectRouter.post('/', isAuthenticated, isUserAuthenticatedVerified, projectController.addProjectData);

/**
 * Route for editing a project by ID.
 * @name PUT /projects/:id
 * @function
 * @memberof module:routes/project.route
 * @inner
 * @param {Function} isAuthenticated - Middleware function for authentication.
 * @param {Function} isUserAuthenticatedVerified - Middleware for authenticating verified user.
 * @param {Function} projectController.editProject - Controller function for editing a project.
 */
projectRouter.put('/:id', isAuthenticated, isUserAuthenticatedVerified, projectController.editProject);

/**
 * Route for deleting a project by ID.
 * @name DELETE /projects/:id
 * @function
 * @memberof module:routes/project.route
 * @inner
 * @param {Function} isAuthenticated - Middleware function for authentication.
 * @param {Function} isUserAuthenticatedVerified - Middleware for authenticating verified user.
 * @param {Function} projectController.deleteProject - Controller function for deleting a project.
 */
projectRouter.delete('/:id', isAuthenticated, isUserAuthenticatedVerified, projectController.deleteProject);

/**
 * Route for getting zip code data by zip code.
 * @name GET /projects/zipCodeData/:zipCode
 * @function
 * @memberof module:routes/project.route
 * @inner
 * @param {Function} isAuthenticated - Middleware function for authentication.
 * @param {Function} isUserAuthenticatedVerified - Middleware for authenticating verified user.
 * @param {Function} projectController.getZipCodeData - Controller function for getting zip code data.
 */
projectRouter.get('/zipCodeData/:zipCode', isAuthenticated, isUserAuthenticatedVerified, projectController.getZipCodeData);

/**
 * Route for adding zip code data.
 * @name POST /projects/zipCode
 * @function
 * @memberof module:routes/project.route
 * @inner
 * @param {Function} isAuthenticated - Middleware function for authentication.
 * @param {Function} isUserAuthenticatedVerified - Middleware for authenticating verified user.
 * @param {Function} projectController.addZipCodeData - Controller function for adding zip code data.
 */
projectRouter.post('/zipCode', isAuthenticated, isUserAuthenticatedVerified, projectController.addZipCodeData);

/**
 * Route for getting analyzed data of a project by ID.
 * @name GET /projects/:id/dataAnalyzed
 * @function
 * @memberof module:routes/project.route
 * @inner
 * @param {Function} isAuthenticated - Middleware function for authentication.
 * @param {Function} isUserAuthenticatedVerified - Middleware for authenticating verified user.
 * @param {Function} projectController.getDataAnalyzed - Controller function for getting analyzed data.
 */
projectRouter.get('/:id/dataAnalyzed', isAuthenticated, isUserAuthenticatedVerified, projectController.getDataAnalyzed);

/**
 * Route for generating an Excel file for a project by ID.
 * @name POST /projects/:id/generateExcel
 * @function
 * @memberof module:routes/project.route
 * @inner
 * @param {Function} isAuthenticated - Middleware function for authentication.
 * @param {Function} isUserAuthenticatedVerified - Middleware for authenticating verified user.
 * @param {Function} projectController.generateExcel - Controller function for generating an Excel file.
 */
projectRouter.post('/:id/generateExcel', isAuthenticated, isUserAuthenticatedVerified, projectController.generateExcel);

export default projectRouter;