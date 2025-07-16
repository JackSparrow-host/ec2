import mongoose, { Document, Model, Schema } from 'mongoose';

import { AshraeType, BuildingType, HvacHeatingType } from '../constants/enums';

/**
 * Represents a model for comparing fields.
 */
export interface ICompareFields {
    ashrae: AshraeType;
    zipCode: number;
    area: number;
    numberFloors: number;
    buildingType: BuildingType;
    hvacHeatingType: HvacHeatingType
    coolingSqFtTon: number;
    heatingBTUSqFt: number;
}
/**
 * Represents a document that extends the ICompareFields interface.
 */
export interface ICompareFieldsDocument extends ICompareFields, Document {}

/**
 * Represents a document that extends the ICompareFields interface.
 */
export interface ICompareFieldsDocument extends ICompareFields, Document {}

/**
 * Schema for comparing fields.
 */
const CompareFieldsSchema = new Schema<ICompareFieldsDocument>({
    ashrae: { type: String, required: true, enum: Object.values(AshraeType), default: AshraeType.NONE },
    zipCode: { type: Number, required: true },
    area: { type: Number, required: true },
    numberFloors: { type: Number, required: true },
    buildingType: { type: String, required: true, enum: Object.values(BuildingType), default: BuildingType.NONE },
    hvacHeatingType: { type: String, required: true, enum: Object.values(HvacHeatingType), default: HvacHeatingType.NONE },
    coolingSqFtTon: { type: Number, required: true },
    heatingBTUSqFt: { type: Number, required: true },
});

export const CompareFields: Model<ICompareFieldsDocument> = mongoose.model<ICompareFieldsDocument>('CompareFields', CompareFieldsSchema);
