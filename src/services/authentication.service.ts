import { Profile } from "passport-google-oauth20";

import { UserGoogleLogin, UserLoggedIn } from "../interfaces/user.interface";
import { User, getUserByGoogleId } from "../models/user.model";
import { Role, UserStatus } from "../constants/enums";

/**
 * Logs in a user and returns the logged-in user information.
 * If the user already exists, updates the session token and returns the existing user.
 * If the user does not exist, creates a new user and returns the newly created user.
 * @param user - The user profile obtained from the authentication provider.
 * @param accessToken - The access token obtained from the authentication provider.
 * @returns A promise that resolves to a UserLoggedIn object representing the logged-in user.
 * @throws Throws an error if there is an issue with logging in or creating the user.
 */
async function successLogin(user: Profile, accessToken: string): Promise<UserLoggedIn> {
    try {
        const existUser = await getUserByGoogleId(user.id);

        if(existUser){
            existUser.sessionToken = accessToken;
            await existUser.save();
            return new UserLoggedIn(existUser);
        } else {
            const newUser = await User.create({
                google_id: user.id,
                displayName: user.displayName,
                email: user.emails?.[0].value,
                provider: user.provider,
                sessionToken: accessToken,
                role: Role.USER,
                status: UserStatus.UNVERIFIED,
                darkMode: false
            });
            return new UserLoggedIn(newUser);
        }
    } catch (error) {
        throw error;
    }
}

/**
 * Signs in a user using Google authentication.
 * If the user already exists, updates the session token, access token, and nonce.
 * If the user does not exist, creates a new user with the provided information.
 * @param user - The user object containing Google login details.
 * @returns A promise that resolves to the logged-in user object.
 */
async function googleSignIn(user: UserGoogleLogin): Promise<UserLoggedIn> {
    const existUser = await getUserByGoogleId(user.google_id);
    if(existUser){
        existUser.sessionToken = user.sessionToken;
        existUser.accessToken = user.accessToken;
        existUser.nonce = user.nonce;
        await existUser.save();
        return new UserLoggedIn(existUser);
    } else {
        const newUser = await User.create({
            google_id: user.google_id,
            displayName: user.displayName,
            email: user.email,
            provider: 'google',
            sessionToken: user.sessionToken,     
            accessToken: user.accessToken,       
            nonce: user.nonce,
            role: Role.USER,
            status: UserStatus.UNVERIFIED,
            darkMode: false
        });
        return new UserLoggedIn(newUser);
    }
}

export { googleSignIn, successLogin };