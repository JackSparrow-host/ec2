/**
 * This file contains the implementation of the Google OAuth2 authentication strategy using Passport.js.
 */

import passport from "passport";
import { Strategy, Profile, VerifyCallback, _StrategyOptionsBase } from "passport-google-oauth20";

import { successLogin } from "../services/authentication.service";
import config from '../config/config';

/**
 * Options for the Google OAuth2 authentication strategy.
 */
const options: _StrategyOptionsBase = {
    clientID: config.google.google_Id,
    clientSecret: config.google.secret,
    callbackURL: config.google.redirectURL,
    scope:['email', 'profile']
}

passport.use(
    new Strategy(options,
        async (
            accessToken: string,
            refreshToken: string,
            profile: Profile,
            done: VerifyCallback
        ) => {
            successLogin(profile, accessToken);

            return done(null, profile);
        }
    )
);

passport.serializeUser((user: Express.User, done: VerifyCallback) => {
    done(null, user);
});

passport.deserializeUser((user: Express.User, done: VerifyCallback) => {
    done(null, user);
});