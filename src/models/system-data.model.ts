import mongoose, { Document, Model, Schema } from 'mongoose';

/**
 * Represents the system data.
 */
export interface ISystemData {
    number: number;
    systemType: string;
}

/**
 * Represents a document containing system data.
 * Extends the ISystemData interface and the Document interface.
 */
export interface ISystemDataDocument extends ISystemData, Document {};

/**
 * Represents the schema for the SystemData collection in the database.
 */
const SystemDataSchema = new Schema<ISystemDataDocument>({
    number: { type: Number, required: true },
    systemType: { type: String, required: true }
});

/**
 * Represents the SystemData model.
 */
export const SystemData: Model<ISystemDataDocument> 
                                = mongoose.model<ISystemDataDocument>('SystemData', SystemDataSchema);

/**
 * Retrieves system data from the database.
 * @returns {Promise<SystemData[]>} A promise that resolves to an array of SystemData objects.
 */
export const getSystemData = () => SystemData.find().exec();

/**
 * Retrieves system data by its ID.
 * @param id - The ID of the system data.
 * @returns A promise that resolves to the system data object.
 */
export const getSystemDataById = (id: string) => SystemData.findById(id).exec();

/**
 * Retrieves system data by number.
 * @param number The number to search for.
 * @returns A promise that resolves to the system data matching the number.
 */
export const getSystemDataByNumber = (number: number) => SystemData.findOne({ number }).exec();

/**
 * Retrieves system data by system type.
 * @param systemType The system type to filter the data by.
 * @returns A promise that resolves to the system data matching the specified system type.
 */
export const getSystemDataBySystemType = (systemType: string) => SystemData.findOne({ systemType }).exec();