import mongoose, { Document, Model, Schema } from 'mongoose';

/**
 * Represents the LPD data.
 */
export interface ILpdData {
    type: string;
    lpd: number;
}

/**
 * Represents a document that extends the ILpdData interface.
 */
export interface ILpdDataDocument extends ILpdData, Document {};

/**
 * Schema definition for LpdData.
 *
 * @remarks
 * This schema represents the structure of LpdData documents in the database.
 */
const LpdDataSchema = new Schema<ILpdDataDocument>({
    type: { type: String, required: true },
    lpd: { type: Number, required: true }
});

/**
 * Represents the LpdData model.
 */
export const LpdData: Model<ILpdDataDocument> = mongoose.model<ILpdDataDocument>('LpdData', LpdDataSchema);

/**
 * Retrieves the LpdData from the database.
 * @returns {Promise<LpdData[]>} A promise that resolves to an array of LpdData objects.
 */
export const getLpdData = () => LpdData.find().exec();

/**
 * Retrieves LpdData by its ID.
 * @param id - The ID of the LpdData.
 * @returns A promise that resolves to the found LpdData or null if not found.
 */
export const getLpdDataById = (id: string) => LpdData.findById(id).exec();

/**
 * Retrieves LpdData by type.
 * @param type - The type of LpdData to retrieve.
 * @returns A promise that resolves to the LpdData object matching the specified type.
 */
export const getLpdDataByType = (type: string) => LpdData.findOne({ type }).exec();

/**
 * Retrieves LpdData by lpd value.
 * @param lpd - The lpd value to search for.
 * @returns A promise that resolves to the found LpdData or null if not found.
 */
export const getLpdDataByLpd = (lpd: number) => LpdData.findOne({ lpd }).exec();
