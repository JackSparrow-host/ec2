import { Request, Response, NextFunction } from 'express';

import * as projectServices from '../services/project.service';
import * as generateInfoService from '../services/generate-info.service';
import * as fileHandledService from '../services/file-handler.service';
import logger from '../config/logging';
import getErrorMessage from '../shared/error.shared';
import { I_ZipCodeData } from '../interfaces/project.interface';

const NAMESPACE = 'EnergyQC Server Project Controller';

/**
 * Retrieves projects from the database.
 * 
 * @param _req - The request object.
 * @param res - The response object.
 * @param _next - The next function.
 */
const getProjects = async (_req: Request, res: Response, _next: NextFunction) => {
    try {
        logger.info('Get Projects process start', { label: NAMESPACE });
        const sessionToken = _req.headers.authorization || '';

        if (!sessionToken || sessionToken === '') {
            res.status(401).json({ message: 'Unauthorized access' });
            return;
        }

        const projects = await projectServices.getProjectsService(sessionToken);

        logger.info(`Projects obtained successfully`, { label: NAMESPACE });
        res.status(200).json(projects);
    } catch (err: any) {
        const errorMessage = getErrorMessage(err);
        logger.error(`Error getting Projects. ${errorMessage}`, { label: NAMESPACE });
        res.status(500).json({ message: `Error getting Projects: ${errorMessage}` });
    }
};

/**
 * Retrieves a project by its ID.
 * 
 * @param req - The request object.
 * @param res - The response object.
 * @param _next - The next function.
 * @returns The project information.
 */
const getProject = async (req: Request, res: Response, _next: NextFunction) => {
    try {
        logger.info('Get Project', { label: NAMESPACE });

        const projectId = req.params.id;
        const project = await projectServices.getProjectService(projectId);

        logger.info(`Project ${project.name} info obtained successfully`, { label: NAMESPACE });
        res.status(200).json(project);
    } catch (err: any) {
        const errorMessage = getErrorMessage(err);
        logger.error(`Error getting Projects. ${errorMessage}`, { label: NAMESPACE });
        res.status(500).json({ message: `Error getting Projects: ${errorMessage}` });
    }
};

/**
 * Adds project data to the database.
 * 
 * @param req - The request object.
 * @param res - The response object.
 * @param _next - The next function.
 */
const addProjectData = async (req: Request, res: Response, _next: NextFunction) => {
    try {
        logger.info('Add Project data', { label: NAMESPACE });

        const projectData = req.body;
        const sessionToken = req.headers.authorization || '';

        if (!sessionToken || sessionToken === '') {
            res.status(401).json({ message: 'Unauthorized access' });
            return;
        }

        const result = await projectServices.addProjectDataService(projectData, sessionToken);

        logger.info('Project data added successfully', { label: NAMESPACE });
        res.status(200).json({ result });
    } catch (err: any) {
        const errorMessage = getErrorMessage(err);
        logger.error(`Error adding Project data. ${errorMessage}`, { label: NAMESPACE });
        res.status(500).json({ message: `Error adding Project data: ${errorMessage}` });
    }
}

/**
 * Edit a project.
 * 
 * @param req - The request object.
 * @param res - The response object.
 * @param _next - The next function.
 * @returns A JSON response containing the result of the edit operation.
 */
const editProject = async (req: Request, res: Response, _next: NextFunction) => {
    try {
        logger.info('Edit Project data', { label: NAMESPACE });

        const projectId = req.params.id; 
        const projectData = req.body;

        const sessionToken = req.headers.authorization || '';
        if (!sessionToken || sessionToken === '') {
            res.status(401).json({ message: 'Unauthorized access' });
            return;
        }

        const result = await projectServices.editProjectService(projectId, projectData, sessionToken);

        logger.info('Edit Project data successfully', { label: NAMESPACE });
        res.status(200).json({ result });
    } catch (err: any) {
        const errorMessage = getErrorMessage(err);
        logger.error(`Error adding Project data. ${errorMessage}`, { label: NAMESPACE });
        res.status(500).json({ message: `Error adding Project data: ${errorMessage}` });
    }
}

/**
 * Deletes a project.
 * 
 * @param req - The request object.
 * @param res - The response object.
 * @param _next - The next function.
 */
const deleteProject = async (req: Request, res: Response, _next: NextFunction) => {
    try {
        const projectId = req.params.id;  
        logger.info(`Delete Project ${projectId} process start`, { label: NAMESPACE });

        const sessionToken = req.headers.authorization || '';
        if (!sessionToken || sessionToken === '') {
            res.status(401).json({ message: 'Unauthorized access' });
            return;
        }

        const result = await projectServices.deleteProjectService(projectId);

        logger.info(`Project ${projectId} deleted successfully`, { label: NAMESPACE });
        res.status(200).json({ result });
    } catch (err: any) {
        const errorMessage = getErrorMessage(err);
        logger.error(`Error deleting Project: ${errorMessage}`, { label: NAMESPACE });
        res.status(500).json({ message: `Error deleting Project: ${errorMessage}` });
    }
}

/**
 * Retrieves the data for a given zip code.
 * 
 * @param req - The request object.
 * @param res - The response object.
 * @param _next - The next function.
 * @returns A JSON response containing the zip code data.
 */
const getZipCodeData = async (req: Request, res: Response, _next: NextFunction) => {
    try {
        logger.info('Get Zip code', { label: NAMESPACE });
        const zipCode = Number.parseInt(req.params.zipCode);
        const zipCodeData = await projectServices.getZipCodeData(zipCode);

        logger.info(`Zip Code ${zipCodeData.ZIP} info obtained successfully`, { label: NAMESPACE });
        res.status(200).json(zipCodeData);
    } catch (err: any) {
        const errorMessage = getErrorMessage(err);
        logger.error(`Error getting Zip Code Data. ${errorMessage}`, { label: NAMESPACE });
        res.status(500).json({ message: `Error getting Zip Code Data: ${errorMessage}` });
    }
};

/**
 * Adds zip code data to the project.
 * 
 * @param req - The request object.
 * @param res - The response object.
 * @param _next - The next function.
 * @returns A Promise that resolves to the added zip code data.
 */
const addZipCodeData = async (req: Request, res: Response, _next: NextFunction) => {
    try {
        logger.info('Add Zip code data', { label: NAMESPACE });

        const sessionToken = req.headers.authorization || '';
        if (!sessionToken || sessionToken === '') {
            res.status(401).json({ message: 'Unauthorized access' });
            return;
        }

        const zipCode: I_ZipCodeData = new I_ZipCodeData(req.body);
        const result = await projectServices.addZipCodeData(zipCode);

        logger.info('ZipCode data added successfully', { label: NAMESPACE });
        res.status(200).json({ result });
    } catch (err: any) {
        const errorMessage = getErrorMessage(err);
        logger.error(`Error adding Project data. ${errorMessage}`, { label: NAMESPACE });
        res.status(500).json({ message: `Error adding Project data: ${errorMessage}` });
    }
}

/**
 * Retrieves the Energy Model Analysis data for a project.
 * 
 * @param req - The request object.
 * @param res - The response object.
 * @param _next - The next function.
 * @returns A JSON response containing the data input, baseline, and proposed results.
 * @throws If there is an error retrieving the Energy Model Analysis data.
 */
const getDataAnalyzed = async (req: Request, res: Response, _next: NextFunction) => {
    try {
        const projectId = req.params.id; 
        logger.info(`Get Energy Model Analysis from Project ${projectId}`, { label: NAMESPACE });

        const project = await projectServices.getProjectService(projectId);
        if (!project) {
            logger.error(`Project ${projectId} not found`, { label: NAMESPACE });
            res.status(404).json({ message: `Project ${projectId} not found` });
        }

        const dataInputResult = project.fieldsToShow;
        const baselineResult = await fileHandledService.getFileInfo(project, 'baseline');
        const proposedResult = await fileHandledService.getFileInfo(project, 'proposed');

        logger.info(`Energy Model Analysis from project ${projectId} obtained successfully`, { label: NAMESPACE });

        res.status(200).json({ dataInput: dataInputResult, baseline: baselineResult, proposed: proposedResult });
    } catch (err: any) {
        const errorMessage = getErrorMessage(err);
        logger.error(`Error getting Energy Model Analysis. ${errorMessage}`, { label: NAMESPACE });
        res.status(500).json({ message: `Error getting Energy Model Analysis: ${errorMessage}` });
    }
}

/**
 * Generates an Excel file for a project based on the provided data.
 * 
 * @param req - The request object.
 * @param res - The response object.
 * @param _next - The next function.
 * @returns A JSON response indicating the result of the file generation process.
 */
const generateExcel = async (req: Request, res: Response, _next: NextFunction) => {
    try {
        const projectId = req.params.id; 
        const dataAnalyzed = req.body;
        
        const sessionToken = req.headers.authorization || '';
        if (!sessionToken || sessionToken === '') {
            res.status(401).json({ message: 'Unauthorized access' });
            return;
        }
    
        logger.info(`Create Model Analysis file for Project ${projectId} process start`, { label: NAMESPACE });
    
        const result = await generateInfoService.generateExcel(projectId, dataAnalyzed, sessionToken);
    
        logger.info(`Energy Model Analysis file created successfully for project ${projectId} process end successfully`,
                     { label: NAMESPACE });
        res.status(200).json({ result, message: `Energy Model Analysis file created successfully` });
    } catch (err) {
        const errorMessage = getErrorMessage(err);
        logger.error(`Error creating Energy Model Analysis file: ${errorMessage}`, { label: NAMESPACE });
        res.status(500).json({ message: `Error creating Energy Model Analysis file: ${errorMessage}` });
    }
}

export default { getProjects, getProject, addProjectData, editProject, deleteProject, getZipCodeData, addZipCodeData,
                 getDataAnalyzed, generateExcel };