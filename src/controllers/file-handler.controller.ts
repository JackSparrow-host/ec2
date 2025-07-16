import { Request, Response, NextFunction } from 'express';
import path from 'path';

import { checkBucket, generateSignedUrlForFile, getFileFromS3, replaceFilesInS3,
         uploadFilesToS3 } from '../services/file-handler.service';
import getErrorMessage from '../shared/error.shared';
import logger from '../config/logging';

const NAMESPACE = 'EnergyQC Server File Handler Controller';

/**
 * Handles the upload of files.
 * 
 * @param req - The request object.
 * @param res - The response object.
 * @param _next - The next function.
 */
const filesUpload = async (req: Request, res: Response, _next: NextFunction) => {
    try {
        const from = req.query.from?.toString() || '';
        const projectIdToUpdate = req.query.projectId?.toString() || '';
        logger.info('File Upload process started.', { label: NAMESPACE });

        if (!req.files) {
            logger.error('No file uploaded', { label: NAMESPACE });
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const check = await checkBucket();
        if (check.response !== 200) {
            logger.error('Error uploading file bucket do not exist', { label: NAMESPACE });
            res.status(500).json({ message: 'Error uploading files, bucket do not exist' });
        }

        const files = req.files as unknown as Express.Multer.File[];

        const sessionToken = req.headers.authorization || '';
        if (!sessionToken || sessionToken === '') {
            res.status(401).json({ message: 'Unauthorized access' });
            return;
        }

        const filesCreated = await uploadFilesToS3(check.s3, files, sessionToken, projectIdToUpdate, from);

        logger.info('Files uploaded successfully.', { label: NAMESPACE });
        res.status(200).json({ message: 'Files uploaded successfully', data: filesCreated });
    } catch (err: any) {
        const errorMessage = getErrorMessage(err);
        logger.error(`Error uploading files - ${errorMessage}`, { label: NAMESPACE });
        res.status(500).json({ message: `Error uploading files - ${errorMessage}`});
    }
};

/**
 * Replaces a file in the file handler controller.
 * 
 * @param req - The request object.
 * @param res - The response object.
 * @param _next - The next function.
 * @returns A Promise that resolves to the response object.
 */
const replaceFile = async (req: Request, res: Response, _next: NextFunction) => {
    try {
        const from = req.query.from?.toString() || '';
        const projectIdToUpdate = req.query.projectId?.toString() || '';
        const fileId = req.params.id;  
        logger.info('File replace process started.', { label: NAMESPACE });

        if (!req.files) {
            logger.error('No file replaced', { label: NAMESPACE });
            return res.status(400).json({ message: 'No file replaced' });
        }

        const check = await checkBucket();
        if (check.response !== 200) {
            logger.error('Error replacing file bucket do not exist', { label: NAMESPACE });
            res.status(500).json({ message: 'Error replacing files, bucket do not exist' });
        }

        const files = req.files as unknown as Express.Multer.File[];

        const sessionToken = req.headers.authorization || '';
        if (!sessionToken || sessionToken === '') {
            res.status(401).json({ message: 'Unauthorized access' });
            return;
        }

        const filesCreated = await replaceFilesInS3(check.s3, files[0], sessionToken, projectIdToUpdate, fileId, from);

        logger.info('Files replaced successfully.', { label: NAMESPACE });
        res.status(200).json({ message: 'Files replaced successfully', data: filesCreated });
    } catch (err: any) {
        const errorMessage = getErrorMessage(err);
        logger.error(`Error replacing files - ${errorMessage}`, { label: NAMESPACE });
        res.status(500).json({ message: `Error replacing files - ${errorMessage}`});
    }
};

/**
 * Downloads a file from the server.
 * 
 * @param req - The request object.
 * @param res - The response object.
 * @param _next - The next function.
 */
const downloadFile = async (req: Request, res: Response, _next: NextFunction) => {
    try {
        logger.info('Download file process started.', { label: NAMESPACE });

        const sessionToken = req.headers.authorization || '';
        if (!sessionToken || sessionToken === '') {
            res.status(401).json({ message: 'Unauthorized access' });
            return;
        }

        const fileId = req.params.id;
        const check = await checkBucket();
        if (check.response !== 200) {
            logger.error('Error getting file, bucket do not exist', { label: NAMESPACE });
            res.status(500).json({ message: 'Error getting file, Error bucket do not exist' });
        }

        const fileFromS3 = await getFileFromS3(check.s3, fileId, sessionToken);

        if (!fileFromS3) {
            logger.error('Error getting file.', { label: NAMESPACE });
            res.status(500).json({ message: 'Error getting file'});
        } else {
            logger.info('File downloaded successfully.', { label: NAMESPACE });

            let contentType = '';
            const fileExtension = path.extname(fileFromS3.fileName);
            if (fileExtension === '.csv') {
              contentType = 'text/csv';
            } else if (fileExtension === '.xlsx') {
              contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
            }
          
            res.writeHead(200, { 'Content-Type': contentType });

            res.end(fileFromS3.readable);
        }
    } catch (err) {
        const errorMessage = getErrorMessage(err);
        logger.error(`Error getting file. ${ errorMessage }`, { label: NAMESPACE });
        res.status(500).json({ message: `Error getting file. ${ errorMessage }` });
    }
};

/**
 * Generates a signed URL for file download.
 * 
 * @param req - The request object.
 * @param res - The response object.
 * @param _next - The next function.
 * @returns A Promise that resolves to the generated signed URL or an error message.
 * @throws If there is an error generating the signed URL.
 */
const getSignedUrlForDownload = async (req: Request, res: Response, _next: NextFunction) => {
    try {
        logger.info('Generating signed URL for file download started.', { label: NAMESPACE });

        const sessionToken = req.headers.authorization || '';
        if (!sessionToken || sessionToken === '') {
            res.status(401).json({ message: 'Unauthorized access' });
            return;
        }

        const fileId = req.params.id;
        const check = await checkBucket();
        if (check.response !== 200) {
            logger.error('Error generating signed URL, bucket does not exist', { label: NAMESPACE });
            res.status(500).json({ message: 'Error generating signed URL, bucket does not exist' });
        }

        const signedUrl = await generateSignedUrlForFile(check.s3, fileId, sessionToken);

        if (!signedUrl) {
            logger.error('Error generating signed URL.', { label: NAMESPACE });
            res.status(500).json({ message: 'Error generating signed URL'});
        } else {
            logger.info('Signed URL generated successfully.', { label: NAMESPACE });
            res.status(200).json({ url: signedUrl });
        }
    } catch (err) {
        const errorMessage = getErrorMessage(err);
        logger.error(`Error generating signed URL. ${errorMessage}`, { label: NAMESPACE });
        res.status(500).json({ message: `Error generating signed URL. ${errorMessage}` });
    }
};

export default { filesUpload, replaceFile, downloadFile, getSignedUrlForDownload };