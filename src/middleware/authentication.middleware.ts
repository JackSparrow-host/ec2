import { Request, Response } from 'express';
import { OAuth2Client } from 'google-auth-library';

import { IUserDocument, User } from '../models/user.model';
import config from '../config/config';
import logger from '../config/logging';
import { Role, UserStatus } from 'constants/enums';

const client = new OAuth2Client(config.google.google_Id);
const NAMESPACE = 'EnergyQC Authentication Middleware';

/**
 * Middleware function to check if the request is authenticated.
 * It verifies the authorization header and validates the token.
 * If the token is valid, it sets the user payload in the request object and calls the next middleware.
 * If the token is invalid, it returns a 401 Unauthorized response.
 * @param req - The request object.
 * @param res - The response object.
 * @param next - The next middleware function.
 */
async function isAuthenticated(req: Request, res: Response, next: Function) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Missing or invalid authorization header' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: config.google.google_Id
    });
    req.user = ticket.getPayload();
    next();

  } catch (err) {
    logger.error(`Invalid token. ${err}`, { label: NAMESPACE });
    return res.status(401).json({ message: 'Invalid token' });
  }
}

/**
 * Middleware function to check if the user is authenticated as an admin.
 * @param req - The request object.
 * @param res - The response object.
 * @param next - The next function to call in the middleware chain.
 * @returns Promise<void>
 */
async function isAdminAuthenticated(req: Request, res: Response, next: Function) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Missing or invalid authorization header' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: config.google.google_Id
    });
    const user: any = ticket.getPayload();

    if (user && user.email) {
      const dbUser = await User.findOne({ email: user.email });
      if (dbUser && dbUser.role === Role.ADMIN) {
        req.user = user;
        next();
      } else {
        logger.error(`Insufficient permissions.`, { label: NAMESPACE });
        return res.status(403).send('Insufficient permissions');
      }
    }

  } catch (err) {
    logger.error(`Insufficient permissions. ${err}`, { label: NAMESPACE });
    return res.status(401).json({ message: 'Invalid token' });
  }
}

/**
 * Middleware function to check if the user is authenticated as an admin.
 * @param req - The request object.
 * @param res - The response object.
 * @param next - The next function to call in the middleware chain.
 * @returns Promise<void>
 */
async function isUserAuthenticatedVerified(req: Request, res: Response, next: Function) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Missing or invalid authorization header' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: config.google.google_Id
    });
    const user: any = ticket.getPayload();

    if (user && user.email) {
      const dbUser = await User.findOne({ email: user.email });
      if (dbUser && dbUser.status === UserStatus.VERIFIED) {
        req.user = user;
        next();
      } else {
        logger.error(`User Unverified, Insufficient permissions.`, { label: NAMESPACE });
        return res.status(403).send('User Unverified, Insufficient permissions');
      }
    }

  } catch (err) {
    logger.error(`User Unverified, Insufficient permissions. ${err}`, { label: NAMESPACE });
    return res.status(401).json({ message: 'Invalid token' });
  }
}

/**
 * Retrieves user information based on the provided authentication token.
 * @param authenticationToken The authentication token.
 * @returns A promise that resolves to an IUserDocument representing the user information.
 * @throws An error if the user is not found or if there is an error during the retrieval process.
 */
async function getUserInfo(authenticationToken: string): Promise<IUserDocument> {
  if (!authenticationToken.startsWith('Bearer ')) {
    authenticationToken = `Bearer ${authenticationToken}`;
  }
  
  const token = authenticationToken.split(' ')[1];
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: config.google.google_Id
    });
    const user: any = ticket.getPayload();

    if (user && user.email) {
      const dbUser = await User.findOne({ email: user.email });
      if (dbUser) {
        return dbUser;
      } else {
        logger.error(`User not found.`, { label: NAMESPACE });
        throw new Error(`User not found`);
      }
    } else {
      logger.error(`User not found.`, { label: NAMESPACE });
      throw new Error(`User not found`);
    }
  } catch (err: any) {
    logger.error(`User not found: ${err.message}`, { label: NAMESPACE });
    throw new Error(`User not found: ${err.message}`);
  }
}

export { isAuthenticated, isAdminAuthenticated, getUserInfo, isUserAuthenticatedVerified };