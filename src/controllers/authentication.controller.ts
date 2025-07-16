import { NextFunction, Request, Response } from 'express';

import logger from '../config/logging';
import { UserGoogleLogin } from '../interfaces/user.interface';
import { googleSignIn } from '../services/authentication.service';
import getErrorMessage from '../shared/error.shared';

const NAMESPACE = 'EnergyQC Server Serverless Auth Controller';

/**
 * Handles the Google login process.
 * 
 * @param req - The request object.
 * @param res - The response object.
 */
const googleLogin = (req: Request, res: Response) => {
    try {
        logger.info('Login process started.', { label: NAMESPACE });
        res.status(200).json(req.user).end();
        logger.info('Login process Ended successfully.', { label: NAMESPACE });
    } catch (error) {
        const errorMessage = getErrorMessage(error);
        logger.error(`Error occurred while logging in user - ${errorMessage}`, { label: NAMESPACE });
        return res.status(400).send({ message: `Error occurred while logging in user - ${errorMessage}` });
    }
}

/**
 * Handles the successful login process.
 * 
 * @param req - The request object.
 * @param res - The response object.
 * @param _next - The next function.
 */
const successLogIn = (req: Request, res: Response, _next: NextFunction) => {
    try {
        logger.info('Login process success.', { label: NAMESPACE });
        res.status(200).json(req.user).end();
        logger.info('Login process ended successfully.', { label: NAMESPACE });
    } catch (error) {
        const errorMessage = getErrorMessage(error);
        logger.error(`Error occurred while logging in user - ${errorMessage}`, { label: NAMESPACE });
        return res.status(400).send({ message: `Error occurred while logging in user - ${errorMessage}` });
    }
}

/**
 * Handles the failure of the login process.
 * 
 * @param _req - The request object.
 * @param res - The response object.
 * @param _next - The next function.
 * @returns The response with an error message if an error occurs while logging in.
 */
const failureLogIn = (_req: Request, res: Response, _next: NextFunction) => {
    try {
        logger.error(`Login process failed.`, { label: NAMESPACE });
        res.status(400).json({message: 'Failed Log In'}).end();
        logger.info('Login process ended unsuccessfully.', { label: NAMESPACE });
    } catch (error) {
        const errorMessage = getErrorMessage(error);
        return res.status(400).send({ message: `Error occurred while logging in user - ${errorMessage}` });
    }
}

/**
 * Handles the login process.
 * 
 * @param req - The request object.
 * @param res - The response object.
 * @param _next - The next function.
 */
const login = async (req: Request, res: Response, _next: NextFunction) => {
    try {
        logger.info('Login process started.', { label: NAMESPACE });

        const userToLogin: UserGoogleLogin = req.body;
        const foundUser = await googleSignIn(userToLogin);
        res.status(200).json(foundUser).end();
        logger.info('Login process ended successfully.', { label: NAMESPACE });
    } catch (err) {
        const errorMessage = getErrorMessage(err);
        logger.error(`Error occurred while logging in user - ${errorMessage}`, { label: NAMESPACE });
        return res.status(400).send({ message: `Error occurred while logging in user - ${errorMessage}` });
    }
};

/**
 * Logs out the user.
 * 
 * @param req - The request object.
 * @param res - The response object.
 * @param _next - The next function.
 */
const logout = (req: Request, res: Response, _next: NextFunction) => {
    try {
        logger.info('Logout process started.', { label: NAMESPACE });
        req.logout((error: any) => {
            if (error) {
                logger.error('Logout process end with some errors.', { label: NAMESPACE });
                return _next(error);
            }
            logger.info('Logout process ended successfully.', { label: NAMESPACE })
            res.status(200).send('Logout successfully.');
        }
        );
    } catch (error) {
        const errorMessage = getErrorMessage(error);
        logger.error(`Error occurred while logging out user - ${errorMessage}`, { label: NAMESPACE });
        return res.status(400).send({ message: `Error occurred while logging out user - ${errorMessage}` });
    }
}

export default { googleLogin, successLogIn, failureLogIn, login, logout };