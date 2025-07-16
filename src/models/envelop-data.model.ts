import mongoose, { Document, Model, Schema } from 'mongoose';

/**
 * Represents the data for an envelope.
 */
export interface IEnvelopeData {
    Zone: number;
    Roof: string;
    Wall: string;
    Floor: string;
    Window: string;
    Skylight: string;
    SHGC: string;
    SC: string;
    Door: string;
    residential: boolean;
}

/**
 * Represents a document that contains envelope data.
 * Extends the IEnvelopeData interface and the Document interface.
 */
export interface IEnvelopeDataDocument extends IEnvelopeData, Document {}

/**
 * Schema for envelope data.
 */
const EnvelopeDataSchema = new Schema<IEnvelopeDataDocument>({
    Zone: { type: Number, required: true },
    Roof: { type: String, required: true },
    Wall: { type: String, required: true },
    Floor: { type: String, required: true },
    Window: { type: String, required: true },
    Skylight: { type: String, required: true },
    SHGC: { type: String, required: true },
    SC: { type: String, required: true },
    Door: { type: String, required: true },
    residential: { type: Boolean, default: false }
});

/**
 * Represents the EnvelopeData model.
 * @type {Model<IEnvelopeDataDocument>}
 */
export const EnvelopeData: Model<IEnvelopeDataDocument> = mongoose.model<IEnvelopeDataDocument>('EnvelopeData', EnvelopeDataSchema);

/**
 * Retrieves envelope data from the database.
 * @returns {Promise<EnvelopeData[]>} A promise that resolves to an array of EnvelopeData objects.
 */
export const getEnvelopeData = () => EnvelopeData.find().exec();

/**
 * Retrieves envelope data by its ID.
 * @param id - The ID of the envelope data.
 * @returns A promise that resolves to the envelope data with the specified ID.
 */
export const getEnvelopeDataById = (id: string) => EnvelopeData.findById(id).exec();

/**
 * Retrieves envelope data by zone.
 * @param Zone - The zone number.
 * @returns A promise that resolves to the envelope data for the specified zone.
 */
export const getEnvelopeDataByZoneAndResidential = (Zone: number, residential: boolean) => EnvelopeData.findOne({ Zone, residential }).exec();