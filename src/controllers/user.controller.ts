import { Request, Response, NextFunction } from 'express';

import getErrorMessage from '../shared/error.shared';
import * as userServices from '../services/user.service';
import logger from '../config/logging';

const NAMESPACE = 'EnergyQC Server User Controller';

/**
 * Retrieves all users.
 * 
 * @param _req - The request object.
 * @param res - The response object.
 * @param _next - The next function.
 * @returns A JSON response containing the users.
 */
const getUsers = async (_req: Request, res: Response, _next: NextFunction) => {
    try {
        logger.info('Get Users process start', { label: NAMESPACE });

        const users = await userServices.getUsersService();

        logger.info(`Users obtained successfully`, { label: NAMESPACE });
        res.status(200).json(users);
    } catch (err: any) {
        const errorMessage = getErrorMessage(err);
        logger.error(`Error getting Users. ${errorMessage}`, { label: NAMESPACE });
        res.status(500).json({ message: `Error getting Users: ${errorMessage}` });
    }
};

/**
 * Retrieves a user by their ID.
 * 
 * @param req - The request object.
 * @param res - The response object.
 * @param _next - The next function.
 * @returns A JSON response containing the user information.
 */
const getUser = async (req: Request, res: Response, _next: NextFunction) => {
    try {
        logger.info('Get User', { label: NAMESPACE });

        const userId = req.params.id;  
        const user = await userServices.getUserService(userId);

        logger.info(`User ${user.displayName}-${user.email} info obtained successfully`, { label: NAMESPACE });
        res.status(200).json(user);
    } catch (err: any) {
        const errorMessage = getErrorMessage(err);
        logger.error(`Error getting User. ${errorMessage}`, { label: NAMESPACE });
        res.status(500).json({ message: `Error getting User: ${errorMessage}` });
    }
};

/**
 * Updates a user.
 * 
 * @param req - The request object.
 * @param res - The response object.
 * @param _next - The next function.
 * @returns A JSON response containing the updated user.
 */
const updateUser = async (req: Request, res: Response, _next: NextFunction) => {
    try {
        logger.info('Update User', { label: NAMESPACE });

        const userId = req.params.id; 
        const UserToUpdate = req.body;

        const user = await userServices.updateUserService(userId, UserToUpdate);
        res.status(200).json({ user: user });
    } catch (err: any) {
        const errorMessage = getErrorMessage(err);
        logger.error(`Error updating User: ${errorMessage}`, { label: NAMESPACE });
        res.status(500).json({ message: `Error updating User ${errorMessage}` });
    }
};

/**
 * Toggles the dark mode for a user.
 * 
 * @param req - The request object.
 * @param res - The response object.
 * @param _next - The next function.
 * @returns A JSON response containing the updated user.
 */
const toggleDarkMode = async (req: Request, res: Response, _next: NextFunction) => {
    try {
        logger.info('Update Dark mode', { label: NAMESPACE });

        const email = req.params.id; 
        const darkMode = req.body;

        const user = await userServices.toggleDarkModeService(email, darkMode.darkMode);
        res.status(200).json(user);
    } catch (err: any) {
        const errorMessage = getErrorMessage(err);
        logger.error(`Error updating Dark mode: ${errorMessage}`, { label: NAMESPACE });
        res.status(500).json({ message: `Error updating Dark mode ${errorMessage}` });
    }
};

/**
 * Deletes a user.
 * 
 * @param req - The request object.
 * @param res - The response object.
 * @param _next - The next function.
 * @returns A JSON response indicating the result of the deletion.
 */
const deleteUser = async (req: Request, res: Response, _next: NextFunction) => {
    try {
        const userId = req.params.id;  
        logger.info('Delete User', { label: NAMESPACE });

        const result = await userServices.deleteUserService(userId);

        logger.info(`User ${userId} deleted successfully`, { label: NAMESPACE });
        res.status(200).json({ result });
    } catch (err: any) {
        const errorMessage = getErrorMessage(err);
        logger.error(`Error deleting User: ${errorMessage}`, { label: NAMESPACE });
        res.status(500).json({ message: `Error deleting User: ${errorMessage}` });
    }
}

export default { getUsers, getUser, deleteUser, updateUser, toggleDarkMode }