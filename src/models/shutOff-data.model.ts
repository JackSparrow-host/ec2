import mongoose, { Document, Model, Schema } from 'mongoose';

/**
 * Represents the data for shutting off a zone.
 */
export interface IShutOffData {
    zone: string;
    temp: number;
}

/**
 * Represents a document that contains shut off data.
 * Extends the IShutOffData interface and the Document interface.
 */
export interface IShutOffDataDocument extends IShutOffData, Document {};

/**
 * Schema definition for ShutOffData.
 *
 * @remarks
 * This schema represents the structure of ShutOffData documents in the database.
 */
const ShutOffDataSchema = new Schema<IShutOffDataDocument>({
  zone: { type: String, required: true },
  temp: { type: Number, required: true }
});

/**
 * Represents the ShutOffData model.
 */
export const ShutOffData: Model<IShutOffDataDocument> 
                          = mongoose.model<IShutOffDataDocument>('ShutOffData', ShutOffDataSchema);

/**
 * Retrieves shut off data from the database.
 * @returns A promise that resolves to an array of shut off data.
 */
export const getShutOffData = () => ShutOffData.find().exec();

/**
 * Retrieves shut off data by ID.
 * @param id - The ID of the shut off data.
 * @returns A promise that resolves to the shut off data with the specified ID.
 */
export const getShutOffDataById = (id: string) => ShutOffData.findById(id).exec();

/**
 * Retrieves shut off data by zone.
 * @param zone - The zone to retrieve shut off data for.
 * @returns A promise that resolves to the shut off data for the specified zone.
 */
export const getShutOffDataByZone = (zone: string) => ShutOffData.findOne({ zone }).exec();

/**
 * Retrieves shut off data based on temperature.
 * @param temp The temperature to search for.
 * @returns A promise that resolves to the shut off data matching the temperature.
 */
export const getShutOffDataByTemp = (temp: number) => ShutOffData.findOne({ temp }).exec();