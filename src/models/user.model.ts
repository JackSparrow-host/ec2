import mongoose, { Document,Model ,Schema } from "mongoose";

import { Role, UserStatus } from "../constants/enums";

/**
 * Represents a user in the system.
 */
export interface IUser {
    google_id: string;
    displayName: string;
    email: string;
    provider: string;
    sessionToken: string;
    accessToken: string;
    nonce: string;
    role?: Role;
    status?: UserStatus;
    darkMode?: boolean;
}

/**
 * Represents a document that extends the IUser interface.
 */
export interface IUserDocument extends IUser, Document {}

/**
 * Represents the schema for the User model.
 */
const UserSchema = new Schema<IUserDocument>({
    google_id: { type: String, required: true, unique: true },
    displayName: { type: String, required: true },
    email: { type: String, required: true, lowercase: true, unique: true},
    provider: { type: String, required: true },
    sessionToken: { type: String, select: false },
    accessToken: { type: String, select: false },
    nonce: { type: String, required: false },
    role: { type: String, enum: Role, default: 'user' },
    status: { type: String, enum: UserStatus, default: 'unverified' },
    darkMode: { type: Boolean, default: false },
});

/**
 * Represents a user model.
 */
export const User: Model<IUserDocument> = mongoose.model<IUserDocument>('User', UserSchema);

/**
 * Retrieves all users from the database.
 * @returns {Promise<User[]>} A promise that resolves to an array of User objects.
 */
export const getUsers = () => User.find().exec();

/**
 * Retrieves a user by their ID.
 * @param id The ID of the user.
 * @returns A promise that resolves to the user object.
 */
export const getUserById = (id: string) => User.findById(id).exec();

/**
 * Retrieves a user by their Google ID.
 * @param google_id The Google ID of the user.
 * @returns A promise that resolves to the user object.
 */
export const getUserByGoogleId = (google_id: string) => User.findOne({ google_id }).exec();

/**
 * Creates a new user and saves it to the database.
 * @param values - The values to create the user with.
 * @returns A promise that resolves to the created user object.
 */
export const createUser = (values: Record<string, any>) => new User(values).save().then((user) => user.toObject());

/**
 * Deletes a user by their ID.
 * @param id The ID of the user to delete.
 * @returns A promise that resolves to the deleted user.
 */
export const deleteUserById = (id: string) => User.findByIdAndDelete({ _id: id});

/**
 * Updates a user by their ID.
 * @param id - The ID of the user to update.
 * @param values - The values to update the user with.
 * @returns A promise that resolves to the updated user.
 */
export const updateUserById = (id: string, values: Record<string, any>) => User.findByIdAndUpdate({ _id: id}, values);





