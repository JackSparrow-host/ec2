import { UserLoggedIn, UserToUpdate } from "../interfaces/user.interface";
import { IUserDocument, User, deleteUserById } from "../models/user.model";

/**
 * Retrieves a list of users.
 * @returns A promise that resolves to an array of IUserDocument objects representing the users.
 * @throws Throws an error if there was an issue retrieving the users.
 */
async function getUsersService(): Promise<IUserDocument[]> {
    try {
        const users = await User.find().select('-google_id -sessionToken -accessToken').exec();
        return users;
    } catch (error) {
        throw error;
    }
}

/**
 * Retrieves a user service by user ID.
 * @param userId The ID of the user.
 * @returns A promise that resolves to the user document.
 * @throws If the user is not found.
 */
async function getUserService(userId: string): Promise<IUserDocument> {
    try {
        const user = await User.findById(userId).select('-google_id -sessionToken -accessToken').exec();
        if (user) {
            return user;
        } else {
            throw new Error('User not found');
        }
    } catch (error) {
        throw error;
    }
}

/**
 * Updates a user in the database.
 * 
 * @param {string} userId - The ID of the user to update.
 * @param {UserToUpdate} userToUpdate - The updated user data.
 * @returns {Promise<User>} - The updated user.
 * @throws {Error} - If the user is not found or an error occurs during the update.
 */
async function updateUserService(userId: string, userToUpdate: UserToUpdate) {
    try {
        const updatedUser = await User.findById(userId).exec();

        if (!updatedUser) {
            throw new Error('User not found');
        }
    
        updatedUser.displayName = userToUpdate.displayName;
        updatedUser.role = userToUpdate.role;
        updatedUser.status = userToUpdate.status;

        await updatedUser.save();
        return updatedUser;
    } catch (error) {
        throw error;
    }
}

/**
 * Updates the dark mode setting for a user.
 * 
 * @param userId - The ID of the user to update.
 * @param darkMode - The new value for the dark mode setting.
 * @returns The updated user object.
 * @throws If the user is not found or an error occurs while updating the user.
 */
async function toggleDarkModeService(email: string, darkMode: boolean) {
    try {
        const updatedUser = await User.findOne({email}).exec();

        if (!updatedUser) {
            throw new Error('User not found');
        }

        updatedUser.darkMode = darkMode;

        await updatedUser.save();
        return new UserLoggedIn(updatedUser);
    } catch (error: any) {
        throw new Error(`Something went wrong while updating user by ${email}`);
    }
}

/**
 * Deletes a user by their ID.
 * @param userId The ID of the user to delete.
 * @returns A promise that resolves to a boolean indicating whether the user was successfully deleted.
 * @throws If an error occurs while deleting the user.
 */
async function deleteUserService(userId: string): Promise<boolean> {
    try {
        await deleteUserById(userId).exec();
        return true;
    } catch (error) {
        throw error;
    }
}

export { getUserService, getUsersService, deleteUserService, updateUserService, toggleDarkModeService };
