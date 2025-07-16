import mongoose, { Document, Model, Schema } from 'mongoose';

import { ScheduleType } from '../constants/enums';

export interface IOccupancyAssumption {
    name: string;
    peoplePer1000SF: number;
    areaPerPerson: number;
    sensibleHeatPerPerson: number;
    latentHeatPerPerson: number;
    receptacleLoadWPerSf: number;
    equestBuildingType: string[];
    equestSpaceType: string[];
}

export interface IOccupancyAssumptionDocument extends IOccupancyAssumption, Document {}

const OccupancyAssumptionSchema = new Schema<IOccupancyAssumptionDocument>({
    name: { type: String, required: true },
    peoplePer1000SF: { type: Number, required: true },
    areaPerPerson: { type: Number, required: true },
    sensibleHeatPerPerson: { type: Number, required: true },
    latentHeatPerPerson: { type: Number, required: true },
    receptacleLoadWPerSf: { type: Number, required: true },
    equestBuildingType: { type: [String], required: true },
    equestSpaceType: { type: [String], required: true }
});


export const OccupancyAssumption: Model<IOccupancyAssumptionDocument> = 
    mongoose.model<IOccupancyAssumptionDocument>('OccupancyAssumption', OccupancyAssumptionSchema);

/**
 * Represents an envelope with various properties.
 */
export interface IEnvelope {
    roof: string;
    wall: string;
    floor: string;
    windowSHGC: string;
    windowSC: string;
    windowUValue: string;
    skylight: string;
    door: string;
}

/**
 * Represents an envelope document that extends the IEnvelope interface and the Document interface.
 */
export interface IEnvelopeDocument extends IEnvelope, Document {};

/**
 * Mongoose schema for the Envelope model.
 *
 * @remarks
 * This schema defines the structure of the Envelope model, which represents the various fields related to the building envelope.
 *
 * @typeparam T - The type of the document that will be created using this schema.
 */
const EnvelopeSchema = new Schema<IEnvelopeDocument>({
    roof: { type: String },
    wall: { type: String },
    floor: { type: String },
    windowSHGC: { type: String },
    windowSC: { type: String },
    windowUValue: { type: String },
    skylight: { type: String },
    door: { type: String }
});

/**
 * Represents the Envelope model.
 */
export const Envelope: Model<IEnvelopeDocument> = mongoose.model<IEnvelopeDocument>('Envelope', EnvelopeSchema);

/**
 * Represents the fields of a show.
 */
export interface IShowFields {
    location: string;
    area: string;
    electricRates: string;
    gasRates: string;
    airSide: string;
    cooling: string[];
    heating: string[];
    economizer: string;
    lighting: string[];
    envelope: IEnvelope;
    schedules: string;
    occupancyAssumption: IOccupancyAssumption;
}

/**
 * Represents a document that includes show fields.
 * Extends the IShowFields interface and the Document interface.
 */
export interface IShowFieldsDocument extends IShowFields, Document {}

/**
 * Represents the schema for the ShowFields collection.
 */
const ShowFieldsSchema = new Schema<IShowFieldsDocument>({
    location: { type: String },
    area: { type: String },
    electricRates: { type: String },
    gasRates: { type: String },
    airSide: { type: String },
    cooling: [{ type: String }],
    heating: [{ type: String }],
    economizer: { type: String },
    lighting: [{ type: String }],
    envelope: { type: EnvelopeSchema },
    schedules: { type: String, default: ScheduleType.N2_5_NONRESIDENTIAL },
    occupancyAssumption: { type: OccupancyAssumptionSchema }
});

export const ShowFields: Model<IShowFieldsDocument> = mongoose.model<IShowFieldsDocument>('ShowFields', ShowFieldsSchema);