import mongoose, { Document, Model, Schema } from 'mongoose';

/**
 * Represents HVAC data.
 */
export interface IHvacData {
    maxFloors: number;
    maxArea: number;
    ff: number;
    electric: number;
}

/**
 * Represents a document that contains HVAC data.
 * @interface
 * @extends IHvacData
 * @extends Document
 */
export interface IHvacDataDocument extends IHvacData, Document {};

/**
 * Schema definition for HVAC data.
 */
const HvacDataSchema = new Schema<IHvacDataDocument>({
    maxFloors: { type: Number, required: true },
    maxArea: { type: Number, required: true },
    ff: { type: Number, required: true },
    electric: { type: Number, required: true }
});

/**
 * Represents the HvacData model.
 */
export const HvacData: Model<IHvacDataDocument> = mongoose.model<IHvacDataDocument>('HvacData', HvacDataSchema);

/**
 * Retrieves HVAC data from the database.
 * @returns A promise that resolves to an array of HVAC data.
 */
export const getHvacData = () => HvacData.find().sort({ maxArea: 1, maxFloors: 1 }).exec();

/**
 * Retrieves HVAC data by ID.
 * @param id - The ID of the HVAC data to retrieve.
 * @returns A promise that resolves to the retrieved HVAC data.
 */
export const getHvacDataById = (id: string) => HvacData.findById(id).exec();

