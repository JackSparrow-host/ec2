import jwt from "jsonwebtoken";

import { Role, UserStatus } from "../constants/enums";
import config from '../config/config';

/**
 * Represents a logged-in user.
 */
class UserLoggedIn {
    google_id!: string;
    displayName!: string;
    email!: string;
    provider!: string;
    sessionToken!: string;
    accessToken!: string;
    role!: Role;
    status!: UserStatus;
    jwtToken!: string;
    darkMode!: boolean;

    constructor(init?: Partial<UserLoggedIn>) {
        Object.assign(this, init);
        if (init) {            
            this.jwtToken = this.generateToken(init.google_id ?? '', init.email ?? '', init.role ?? Role.USER, init.status ?? UserStatus.UNVERIFIED, init.darkMode ?? false);
        }
    }

    generateToken(id: string, email:string, role: Role, verified: UserStatus, darkMode: boolean) {
        const payload = {
          sub: id,
          email: email,
          role: role,
          verified: verified,
          darkMode: darkMode
        };
      
        return jwt.sign(payload, config.secrets.jwtSecret, { expiresIn: '1h' });
    }
}

/**
 * Represents a user object for Google login.
 */
class UserGoogleLogin {
    google_id!: string;
    email!: string;
    displayName!: string;
    nonce!: string;
    sessionToken!: string;
    accessToken!: string;
}

/**
 * Represents a user object to update.
 */
class UserToUpdate {
    displayName!: string;
    role!: Role;
    status!: UserStatus;
}

export { UserLoggedIn, UserGoogleLogin, UserToUpdate}