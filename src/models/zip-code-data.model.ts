import mongoose, { Schema, Document, Model } from 'mongoose';

/**
 * Represents the data for a zip code.
 */
export interface IZipCodeData {
    ZIP: number;
    STCOUNTYFP: string;
    CITY: string;
    STATE: string;
    COUNTYNAME: string;
    CLIMATEZONE: string;
}

/**
 * Represents a document containing zip code data.
 * Extends the IZipCodeData interface and the Document interface.
 */
export interface IZipCodeDataDocument extends IZipCodeData, Document {};

/**
 * Schema definition for ZipCodeData.
 */
const ZipCodeDataSchema = new Schema<IZipCodeDataDocument>({
    ZIP: { type: Number, required: true },
    STCOUNTYFP: { type: String },
    CITY: { type: String, required: true },
    STATE: { type: String, required: true },
    COUNTYNAME: { type: String, required: true },
    CLIMATEZONE: { type: String, required: true }
});

/**
 * Represents the ZipCodeData model.
 * @type {Model<IZipCodeDataDocument>}
 */
export const ZipCodeData: Model<IZipCodeDataDocument> = mongoose.model<IZipCodeDataDocument>('ZipCodeData', ZipCodeDataSchema);

/**
 * Retrieves the zip code data from the database.
 * @returns {Promise<ZipCodeData[]>} A promise that resolves to an array of zip code data.
 */
export const getZipCodeData = () => ZipCodeData.find().exec();

/**
 * Retrieves zip code data by ID.
 * @param id - The ID of the zip code data to retrieve.
 * @returns A promise that resolves to the zip code data.
 */
export const getZipCodeDataById = (id: string) => ZipCodeData.findById(id).exec();

/**
 * Retrieves zip code data by zip code.
 * @param zipCode The zip code to search for.
 * @returns A promise that resolves to the zip code data.
 */
export const getZipCodeDataByZipCode = (zipCode: number) => ZipCodeData.findOne({ ZIP: zipCode }).exec();