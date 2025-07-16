import mongoose, { Document, Model, Schema } from 'mongoose';

/**
 * Represents the rate data for a specific state.
 */
export interface IRateData {
    State: string;
    Commercial_Electric: number;
    Commercial_Gas: number;
    Residential_Electric: number;
    Residential_Gas: number;
}

/**
 * Represents a document that contains rate data.
 * Extends the IRateData interface and the Document interface.
 */
export interface IRateDataDocument extends IRateData, Document {};

/**
 * Schema for RateData document.
 */
const RateDataSchema = new Schema<IRateDataDocument>({
  State: { type: String, required: true },
  Commercial_Electric: { type: Number, required: true },
  Commercial_Gas: { type: Number, required: true },
  Residential_Electric: { type: Number, required: true },
  Residential_Gas: { type: Number, required: true }
});

/**
 * Represents the RateData model.
 */
export const RateData: Model<IRateDataDocument> = mongoose.model<IRateDataDocument>('RateData', RateDataSchema); 

/**
 * Retrieves rate data from the database.
 * @returns {Promise<RateData[]>} A promise that resolves to an array of RateData objects.
 */
export const getRateData = () => RateData.find().exec();

/**
 * Retrieves rate data by its ID.
 * @param id - The ID of the rate data.
 * @returns A promise that resolves to the rate data with the specified ID.
 */
export const getRateDataById = (id: string) => RateData.findById(id).exec();

/**
 * Retrieves rate data by state.
 * @param State - The state for which to retrieve rate data.
 * @returns A promise that resolves to the rate data for the specified state.
 */
export const getRateDataByState = (State: string) => RateData.findOne({ State }).exec();