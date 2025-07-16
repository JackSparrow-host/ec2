import mongoose, { Schema, Document, Model } from 'mongoose';

/**
 * Represents the result of a project file.
 */
export interface IProjectFileResult {
    shadingCoefficient: string;
    glassConductance: string;
    wallUnitValue: string;
    roofUnitValue: string;
    doorUnitValue: string;
    floorUnitValue: string;
    lpd: string[];
    electricRate: string;
    gasRate: string;
    hvacTypes: string[];
    coolingEIR: string[];
    heatingEIR: string[];
    chillerEIR: string[];
    capacityRatios: string[];
    heatInputRatios: string[];
    hasEconomizer: boolean;
    area: string;
    schedules: string;
    latentHeatPerPerson: string;
    sensibleHeatPerPerson: string;
    receptacleLoadWPerSf: string;
    areaPerPerson: string;
}

/**
 * Represents a document that contains the result of a project file.
 * Extends the IProjectFileResult interface and the Document class.
 */
export interface IProjectFileResultDocument extends IProjectFileResult, Document {};

/**
 * Schema definition for the ProjectFileResult document.
 */
const ProjectFileResultSchema = new Schema<IProjectFileResultDocument>({
    shadingCoefficient: { type: String, required: false },
    glassConductance: { type: String, required: false },
    wallUnitValue: { type: String, required: false },
    roofUnitValue: { type: String, required: false },
    doorUnitValue: { type: String, required: false },
    floorUnitValue: { type: String, required: false },
    lpd: { type: [String], required: false },
    electricRate: { type: String, required: false },
    gasRate: { type: String, required: false },
    hvacTypes: { type: [String], required: false },
    coolingEIR: { type: [String], required: false },
    heatingEIR: { type: [String], required: false }, 
    chillerEIR: { type: [String], required: false },
    capacityRatios: { type: [String], required: false },
    heatInputRatios: { type: [String], required: false },
    hasEconomizer: { type: Boolean, required: false },
    area: { type: String, required: false},
    schedules: { type: String, required: false },
    latentHeatPerPerson: { type: String, required: false },
    sensibleHeatPerPerson: { type: String, required: false },
    receptacleLoadWPerSf: { type: String, required: false },
    areaPerPerson: { type: String, required: false }
})

/**
 * Represents a result of a project file.
 */
export const ProjectFileResult: Model<IProjectFileResultDocument> 
                = mongoose.model<IProjectFileResultDocument>('ProjectFileResult', ProjectFileResultSchema);

/**
 * Represents a project file.
 */
export interface IProjectFile {
    name: string;
    from: string;
    size: number;
    type: string;
    url: string;
    fileResult: IProjectFileResult;
}

/**
 * Represents a document for a project file.
 * Extends the IProjectFile interface and the Document interface.
 */
export interface IProjectFileDocument extends IProjectFile, Document {};

/**
 * Represents the schema for a project file.
 *
 * @remarks
 * This schema defines the structure and properties of a project file.
 *
 * @public
 */
const ProjectFileSchema = new Schema<IProjectFileDocument>({
    name: { type: String, required: true, unique: true },
    from: { type: String, required: true },
    size: { type: Number, required: true },
    type: { type: String, required: true },
    url: { type: String, required: true, unique: true },
    fileResult: { type: ProjectFileResultSchema },
});

/**
 * Represents a project file.
 */
export const ProjectFile = mongoose.model<IProjectFileDocument>('ProjectFile', ProjectFileSchema);

/**
 * Retrieves all project files from the database.
 * @returns {Promise<ProjectFile[]>} A promise that resolves to an array of project files.
 */
export const getProjectFiles = () => ProjectFile.find().exec();

/**
 * Retrieves a project file by its ID.
 * @param id The ID of the project file.
 * @returns A promise that resolves to the project file with the specified ID.
 */
export const getProjectFileById = (id: string) => ProjectFile.findById(id).exec();

/**
 * Retrieves a project file by its name.
 * @param name - The name of the project file.
 * @returns A promise that resolves to the project file if found, or null if not found.
 */
export const getProjectFileByName = (name: string) => ProjectFile.findOne({name}).exec();

/**
 * Retrieves a project file by its URL.
 * @param url - The URL of the project file.
 * @returns A promise that resolves to the found project file, or null if not found.
 */
export const getProjectFileByUrl = (url: string) => ProjectFile.findOne({url}).exec();

/**
 * Creates a new project file.
 * 
 * @param values - The values to initialize the project file with.
 * @returns A promise that resolves to the created project file object.
 */
export const createProjectFile = (values: Record<string, any>) =>
                                 new ProjectFile(values).save().then((projectFile) => projectFile.toObject());

/**
 * Deletes a project file by its ID.
 * @param id The ID of the project file to delete.
 * @returns A promise that resolves to the deleted project file.
 */
export const deleteProjectFileById = (id: string) => ProjectFile.findByIdAndDelete({ _id: id});

/**
 * Updates a project file by its ID.
 * @param id - The ID of the project file to update.
 * @param values - The values to update the project file with.
 * @returns A promise that resolves to the updated project file.
 */
export const updateProjectFileById = (id: string, values: Record<string, any>) => ProjectFile.findByIdAndUpdate({ _id: id}, values);
