import { S3 } from "aws-sdk";
import { CreateBucketRequest } from 'aws-sdk/clients/s3';

import config from '../config/config';
import getValuesFromEncryptedConfig from "../config/aws-bucket";
import { ProjectStatus } from "../constants/enums";
import { I_ProjectFileCreate, I_ShowFields } from "../interfaces/project.interface";
import { getUserInfo } from "../middleware/authentication.middleware";
import { IProjectDocument, updateProjectById } from "../models/project.model";
import { Envelope, OccupancyAssumption, ShowFields } from "../models/show-fields.model";
import { IProjectFileDocument, ProjectFile, ProjectFileResult, createProjectFile, deleteProjectFileById,
         getProjectFileById } from "../models/project-file.model";
import { getInpValues, parseInpFile } from "../services/parse-input-file.service";
import { getProjectService } from "../services/project.service";

/**
 * Checks the availability of a bucket in S3.
 * @returns A promise that resolves to an object containing the HTTP response code and the S3 instance.
 * @throws If an error occurs during the process.
 */
async function checkBucket(): Promise<{response: number, s3: S3}>  {
    try {
      let response = 403;
      const { clientId, clientSecret } = getValuesFromEncryptedConfig();
      const s3 = new S3({
          accessKeyId: clientId,
          secretAccessKey: clientSecret,
      });
      await s3.headBucket({Bucket: config.drive.bucketName}).promise().then((data) => {
        response = data.$response.httpResponse.statusCode;
      });  
      
      return {response, s3};
    } catch (error: any) {    
      throw new Error(error) 
    }
};

/**
 * Creates a bucket in Amazon S3.
 * @param s3 The S3 client object.
 * @returns A promise that resolves to an object containing the success status, message, and data.
 */
async function createBucket(s3: S3) {
    const params: CreateBucketRequest = { Bucket: config.drive.bucketName,
      CreateBucketConfiguration: { LocationConstraint: "us-east-1" }
    };
  
    try {
      const res = await s3.createBucket(params).promise();  
      return {success: true, message: "Bucket Created Successful", data: res.Location};
    } catch (error) {
  
      return {success: false, message: "Unable to create bucket", data: error};
    }
};

/**
 * Retrieves a file from S3 bucket.
 * @param s3 - The S3 instance.
 * @param fileId - The ID of the file to retrieve.
 * @returns A promise that resolves to an object containing the readable stream of the file and its file name.
 * @throws If the file cannot be retrieved from the bucket.
 */
async function getFileFromS3(s3: S3, fileId: string, sessionToken: string): Promise<{ readable: Buffer, fileName: string }> {
    try {
        const user = await getUserInfo(sessionToken);
      
        if (!user) {
            throw new Error('User not found');
        }

        const file = await getProjectFileById(fileId);
  
        if (!file) {
            throw new Error('File cannot be retrieved from bucket');
        }
  
        const params = {
            Bucket: config.drive.bucketName,
            Key: file.name,
        };
  
        try {
            const getObjectResponse = await s3.getObject(params).promise();
            const fileData = getObjectResponse.Body as Buffer;
            return { readable: fileData, fileName: file.name };
        } catch (error) {
            throw error;
        }
    } catch (error) {
        throw new Error('File cannot be retrieved from bucket');
    }
}

/**
 * Generates a signed URL for a file in the S3 bucket.
 * 
 * @param {S3} s3 - The S3 instance.
 * @param {string} fileId - The ID of the file.
 * @param {string} sessionToken - The session token.
 * @returns {Promise<string | null>} - A promise that resolves to the signed URL or null if an error occurs.
 * @throws {Error} - If the user is not found or the file cannot be retrieved from the bucket.
 */
async function generateSignedUrlForFile(s3: S3, fileId: string, sessionToken: string): Promise<string | null> {
    try {
        const user = await getUserInfo(sessionToken);

        if (!user) {
            throw new Error('User not found');
        }

        const file = await getProjectFileById(fileId);
  
        if (!file) {
            throw new Error('File cannot be retrieved from bucket');
        }

        const params = {
            Bucket: config.drive.bucketName,
            Key: file.name,
            Expires: 60 // URL válida por 60 segundos
        };

        try {
            const signedUrl = await s3.getSignedUrlPromise('getObject', params);
            return signedUrl;
        } catch (error) {
            throw error;
        }
    } catch (error) {
        throw new Error('File cannot be retrieved from bucket');
    }
}

/**
 * Uploads files to S3 bucket.
 * 
 * @param s3 - The S3 instance.
 * @param filesData - The array of files to upload.
 * @param sessionToken - The session token.
 * @param projectIdToUpdate - The ID of the project to update.
 * @param from - The source of the upload.
 * @returns A promise that resolves to an array of objects containing the uploaded file and the updated project.
 * @throws An error if the files cannot be uploaded to the bucket.
 */
async function uploadFilesToS3 (s3: S3, filesData: Express.Multer.File[], sessionToken: string, projectIdToUpdate: string, from: string)
                      : Promise<{file: I_ProjectFileCreate, project: IProjectDocument}[]> {
    try {
        const user = await getUserInfo(sessionToken);
      
        if (!user) {
            throw new Error('User not found');
        }

        const filesUploaded: {file: I_ProjectFileCreate, project: IProjectDocument}[] = [];
        for (const file of filesData!) {
            const fileUploaded = await uploadFileToS3(s3, file, sessionToken, projectIdToUpdate, from);
            filesUploaded.push(fileUploaded);
        }
        return filesUploaded;
    }
    catch (error) {
      throw new Error('Files can not be uploaded to bucket');
    }
}

/**
 * Uploads a file to Amazon S3 and updates the project with the uploaded file information.
 * @param s3 - The S3 instance.
 * @param fileData - The file data to upload.
 * @param sessionToken - The session token.
 * @param projectIdToUpdate - The ID of the project to update.
 * @param from - The source of the file ('baseline' or 'proposed').
 * @returns A promise that resolves to an object containing the created file and the updated project.
 * @throws An error if the file already exists in the bucket with the same name or if the file could not be uploaded.
 */
async function uploadFileToS3(s3: S3, fileData: Express.Multer.File, sessionToken: string, projectIdToUpdate: string,
                              from: string): Promise<{ file: I_ProjectFileCreate, project: IProjectDocument }> {
    try {
        const user = await getUserInfo(sessionToken);
      
        if (!user) {
            throw new Error('User not found');
        }

        const dateToName = new Date().getTime();
        const params = {
            Bucket: config.drive.bucketName,
            Key: `${getOnlyName(fileData.originalname)}-${dateToName}.inp`,
            Body: fileData.buffer
        };

        const uploadResult = await s3.upload(params).promise();
        const { Location: url } = uploadResult;

        const fileContent = fileData.buffer.toString('utf-8');
        const lines = fileContent.split("\n").filter(line => line !== "\r");

        const fileToJson = parseInpFile(lines);
        const result =  new ProjectFileResult(getInpValues(fileToJson));

        const createdFile: I_ProjectFileCreate = {
            name: `${getOnlyName(fileData.originalname)}-${dateToName}.inp`,
            from: from,
            size: fileData.size,
            type: fileData.mimetype,
            url: url,
            fileResult: result
        };

        const fileCreated = await createProjectFile(createdFile);

        let projectToUpdate = await getProjectService(projectIdToUpdate);

        if (!projectToUpdate) {
            throw new Error('Project not found');
        }

        if (projectToUpdate.outputFile !== null) {
            const outputFileToDelete = await ProjectFile.findById(projectToUpdate.outputFile);
            if (outputFileToDelete) {
                await deleteFileFromS3(s3, outputFileToDelete._id);
                projectToUpdate.outputFile = undefined;
            }
        }

        if (from === 'baseline') {
            projectToUpdate.baselineInput = fileCreated._id;
        } else if (from === 'proposed') {
            projectToUpdate.proposedInput = fileCreated._id;
        }
        projectToUpdate.updatedAt = new Date();
        projectToUpdate.createdBy = user?._id;
        projectToUpdate.status = ProjectStatus.STARTED;
        await updateProjectById(projectIdToUpdate, projectToUpdate);

        return { file: fileCreated, project: projectToUpdate };
    } catch (error: any) {
        if (error.message.includes('E11000')) {
            throw new Error('File already exists in the bucket with the same name');
        }
        throw new Error(`File could not be uploaded to the bucket ${error.message}`);
    }
}

/**
 * Copies a file from S3 bucket to a new location with a modified name.
 * @param s3 - The S3 service object.
 * @param fileId - The ID of the file to be copied.
 * @param dateToName - The number used to modify the name of the copied file.
 * @returns A promise that resolves to an object containing the copied file.
 * @throws An error if the file cannot be retrieved from the bucket or if an error occurs during the copy operation.
 */
async function copyFileFromS3(s3: S3, fileId: string, dateToName: number): Promise<{ file: IProjectFileDocument }> {
    const file = await getProjectFileById(fileId);

    if (!file) {
        throw new Error('File cannot be retrieved from bucket');
    }

    const nameToCopy = `(${dateToName})-${file.name}`;
    const params = {
        Bucket: config.drive.bucketName,
        CopySource: `${config.drive.bucketName}/${file.name}`,
        Key: nameToCopy,
    };

    try {
      await s3.copyObject(params).promise();

      const createdFile: I_ProjectFileCreate = {
          name: nameToCopy,
          from: file.from,
          size: file.size,
          type: file.type,
          url: `${config.drive.bucketName}/${nameToCopy}`,
          fileResult: file.fileResult
      };

      const fileCreated = await createProjectFile(createdFile);

      return { file: fileCreated};
    } catch (error) {
        throw error;
    }
}

/**
 * Deletes a file from S3 bucket.
 * @param s3 - The S3 instance.
 * @param fileId - The ID of the file to be deleted.
 * @returns A promise that resolves to a boolean indicating whether the file was successfully deleted.
 * @throws An error if the file cannot be deleted from the bucket.
 */
async function deleteFileFromS3(s3: S3, fileId: string): Promise<boolean> {
    try {
        const fileDeleted = await getProjectFileById(fileId);
  
        if (!fileDeleted) {
            throw new Error('File cannot be deleted from bucket');
        }
  
        const params = {
            Bucket: config.drive.bucketName,
            Key: fileDeleted.name,
        };
  
        await s3.deleteObject(params).promise();
        await deleteProjectFileById(fileDeleted._id);
  
        return true;
    } catch (error) {
        throw new Error('File cannot be deleted from bucket');
    }
}

/**
 * Replaces files in S3 bucket.
 * 
 * @param s3 - The S3 instance.
 * @param filesData - The file data to upload.
 * @param sessionToken - The session token.
 * @param projectIdToUpdate - The ID of the project to update.
 * @param fileId - The ID of the file to replace.
 * @param from - The source of the file to replace.
 * @returns An object containing the newly uploaded file and the updated project.
 * @throws Error if files cannot be replaced in the bucket.
 */
async function replaceFilesInS3(s3: S3, filesData: Express.Multer.File, sessionToken: string, projectIdToUpdate: string,
                                fileId: string, from: string): Promise<{file: I_ProjectFileCreate, project: IProjectDocument}> {
    try {
        const fileUploaded = await uploadFileToS3(s3, filesData, sessionToken, projectIdToUpdate, from);

        await deleteFileFromS3(s3, fileId);
        return fileUploaded;
    } catch (error) {
      throw new Error('Files can not be replaced in bucket');
    }
}

/**
 * Retrieves the file information for a given project and file type.
 * @param project - The project document.
 * @param fileType - The type of file to analyze ('baseline' or 'proposed').
 * @returns A promise that resolves to an instance of I_ShowFields representing the file information.
 */
async function getFileInfo(project: IProjectDocument, fileType: string): Promise<I_ShowFields> {
    const fileToAnalyze = fileType === 'baseline' 
                            ? await ProjectFile.findById(project.baselineInput)
                            : await ProjectFile.findById(project.proposedInput);

    if (!fileToAnalyze) {
        return new I_ShowFields();
    }
     
    const result = new ShowFields({
        location: '-',
        area: fileToAnalyze.fileResult.area,
        electricRates: `${operation(fileToAnalyze.fileResult.electricRate, 'electricRate')} ¢/kW-hr`,
        gasRates: `${operation(fileToAnalyze.fileResult.gasRate, 'gasRate')} $/therm`,
        airSide: fileToAnalyze.fileResult.hvacTypes.length > 0
            ? fileToAnalyze.fileResult.hvacTypes.join('-')
            : '-',
        cooling: fileToAnalyze.fileResult.coolingEIR.length === 0 
            ? fileToAnalyze.fileResult.chillerEIR[0] === 'Default Value'
                ? fileToAnalyze.fileResult.chillerEIR.map((chiller) => ` ${chiller}`)
                    : fileToAnalyze.fileResult.chillerEIR.map((chiller) => ` ${chiller} EIR`)
                : fileToAnalyze.fileResult.coolingEIR.map((cooling) => ` ${cooling} EIR`),
        heating: [
            ...fileToAnalyze.fileResult.heatInputRatios.map((heating) => ` ${heating} AFUE`),
            ...fileToAnalyze.fileResult.heatingEIR.map((heating) => {
                return heating.includes('COP') || heating.includes('AFUE')
                    ? heating
                    : ` ${heating} EIR`;
                })
            ],
        economizer: fileToAnalyze.fileResult.hasEconomizer ? 'Yes' : 'No',
        lighting: fileToAnalyze.fileResult.lpd.length === 0 ? '-' : fileToAnalyze.fileResult.lpd.map((lpd) => ` ${lpd} W/SqFt`),
        envelope: new Envelope({
            roof: `U-${fileToAnalyze.fileResult.roofUnitValue}`,
            wall: `U-${fileToAnalyze.fileResult.wallUnitValue}`,
            floor: `U-${fileToAnalyze.fileResult.floorUnitValue || '0'}`,
            windowSHGC: `${operation(fileToAnalyze.fileResult.shadingCoefficient, 'shadingCoefficient')}`,
            windowSC: `${operation(fileToAnalyze.fileResult.shadingCoefficient, 'shadingCoefficient')}`,
            // windowSHGC: `${operation(fileToAnalyze.fileResult.shadingCoefficient, 'shadingCoefficient') * 0.87}`,
            windowUValue: `U-${fileToAnalyze.fileResult.glassConductance}`,
            skylight: '-',
            door: `U-${fileToAnalyze.fileResult.doorUnitValue || '0'}`,
        }),
        occupancyAssumption: new OccupancyAssumption({
            name: fileType === 'baseline' ? 'Baseline' : 'Proposed',
            peoplePer1000SF: 10,
            areaPerPerson: fileToAnalyze.fileResult.areaPerPerson,
            sensibleHeatPerPerson: fileToAnalyze.fileResult.sensibleHeatPerPerson,
            latentHeatPerPerson: fileToAnalyze.fileResult.latentHeatPerPerson,
            receptacleLoadWPerSf: fileToAnalyze.fileResult.receptacleLoadWPerSf,
            equestBuildingType: [],
            equestSpaceType: []
        }),
        schedules: fileToAnalyze.fileResult.schedules
    });
    
    return result;
}

/**
 * Retrieves the name portion of a file name by removing the file extension.
 * @param originalname - The original file name.
 * @returns The name portion of the file name.
 */
function getOnlyName(originalname: string): string {
    const nameSplitted = originalname.split('.');
    
    if (nameSplitted.length >= 2) {
        nameSplitted.pop();
        return nameSplitted.join('.');
    } else {
      return originalname;
    }
}

/**
 * Performs a specific operation based on the input and field.
 * If the field is "shadingCoefficient", it expects the input to be in the format "{number1/number2}".
 * If the field is "electricRate" or "gasRate", it also expects the input to be in the format "{number1/number2}".
 * Otherwise, it throws an error.
 * 
 * @param input - The input string.
 * @param field - The field indicating the type of operation to perform.
 * @returns The result of the operation as a number.
 * @throws Error if the field is not valid or the input format is incorrect.
 */
function operation(input: string, field: string): number {
    let regex: RegExp;

    if (field === "shadingCoefficient") {
        regex = /\{(\d+(\.\d+)?)\/(\d+(\.\d+)?)\}/;
    } else if (field === "electricRate" || field === "gasRate") {
        regex = /\{(\d+(\.\d+)?)\/(\d+(\.\d+)?)\}/;
    } else {
        throw new Error("Something went wrong");
    }

    const match = input.match(regex);

    if (match) {
        const number1 = parseFloat(match[1]);
        const number2 = parseFloat(match[3]);

        if (!isNaN(number1) && !isNaN(number2) && number2 !== 0) {
            return number1 / number2;
        }
    } else {
        const number = parseFloat(input);
        if (!isNaN(number)) {
            return number;
        }
    }
    return 0;
}

export { checkBucket, createBucket, uploadFileToS3, uploadFilesToS3, deleteFileFromS3, getFileFromS3, replaceFilesInS3,
         copyFileFromS3, getFileInfo, generateSignedUrlForFile };
