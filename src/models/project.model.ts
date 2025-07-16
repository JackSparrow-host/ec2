import mongoose, { Model, Schema } from 'mongoose';

import { User } from '../models/user.model';
import { ProjectFile } from '../models/project-file.model';
import { CompareFields } from '../models/compare-fields.model';
import { ShowFields } from '../models/show-fields.model';
import { ProjectStatus } from '../constants/enums';

/**
 * Represents a project.
 */
export interface IProject {
    projectId: string;
    name: string;
    description: string;
    status: ProjectStatus;
    baselineInput: typeof ProjectFile | undefined;
    proposedInput: typeof ProjectFile | undefined;
    outputFile: typeof ProjectFile | undefined;
    createdAt: Date;
    updatedAt: Date;
    createdBy: typeof User;
    fieldsToCompare: typeof CompareFields;
    fieldsToShow: typeof ShowFields;
}

/**
 * Represents a project document that extends the IProject interface and the Document interface.
 */
export interface IProjectDocument extends IProject, Document {};

/**
 * Represents the schema for the Project model.
 */
const ProjectSchema = new Schema<IProjectDocument>({
    projectId: { type: String, required: true },
    name: { type: String, required: true, unique: true },
    description: { type: String},
    status: { type: String, required: true, enum: Object.values(ProjectStatus), default: ProjectStatus.STARTED },
    baselineInput: { type: mongoose.Schema.Types.ObjectId, ref: 'ProjectFile' },
    proposedInput: { type: mongoose.Schema.Types.ObjectId, ref: 'ProjectFile' },
    outputFile: { type: mongoose.Schema.Types.ObjectId, ref: 'ProjectFile' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    fieldsToCompare: { type: mongoose.Schema.Types.ObjectId, ref: 'CompareFields' },
    fieldsToShow: { type: mongoose.Schema.Types.ObjectId, ref: 'ShowFields' },
});

/**
 * Represents a project in the application.
 */
export const Project: Model<IProjectDocument> = mongoose.model<IProjectDocument>('Project', ProjectSchema);

/**
 * Retrieves all projects from the database.
 * @returns {Promise<Project[]>} A promise that resolves to an array of projects.
 */
export const getProjects = () => Project.find().exec();

/**
 * Retrieves a project by its ID.
 * @param id The ID of the project.
 * @returns A promise that resolves to the project with the specified ID.
 */
export const getProjectById = (id: string) => Project.findById(id).exec();

/**
 * Deletes a project by its ID.
 * @param id The ID of the project to delete.
 * @returns A promise that resolves to the deleted project.
 */
export const deleteProjectById = (id: string) => Project.findByIdAndDelete({ _id: id});

/**
 * Updates a project by its ID.
 * @param id - The ID of the project to update.
 * @param values - The values to update the project with.
 * @returns A promise that resolves to the updated project.
 */
export const updateProjectById = (id: any, values: mongoose.UpdateQuery<IProjectDocument> | undefined) => Project.findByIdAndUpdate({ _id: id}, values);