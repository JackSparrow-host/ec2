import ExcelJS from 'exceljs';

import { checkBucket, deleteFileFromS3 } from './file-handler.service';
import config from '../config/config';
import transporter from '../config/mailer';
import { ProjectStatus } from '../constants/enums';
import { I_DataAnalyzed, I_ProjectFileCreate } from '../interfaces/project.interface';
import { IUserDocument } from '../models/user.model';
import { ProjectFile, createProjectFile } from '../models/project-file.model';
import { getUserInfo } from '../middleware/authentication.middleware';
import { IProjectDocument, Project, updateProjectById } from '../models/project.model';

/**
 * Generates an Excel file with the provided data for a specific project.
 * 
 * @param projectId - The ID of the project.
 * @param fullDataSet - An array of data to be included in the Excel file.
 * @param sessionToken - The session token of the user.
 * @returns A promise that resolves to a boolean indicating whether the Excel file generation was successful.
 * @throws An error if the project is not found, the user is not found, or an error occurs during the generation process.
 */
async function generateExcel(projectId: string, fullDataSet: I_DataAnalyzed[], sessionToken: string): Promise<boolean> {
    try {
        let projectToUpdate = await Project.findById(projectId);

        if (!projectToUpdate) {
            throw new Error('Project not found');
        }

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet(`Energy Model Analysis for ${projectToUpdate.name}`);

        let headers = getHeaders();
        let columns = headers.map(header => {
            return { key: header.id, width: 40 };
        });
        worksheet.columns = columns;

        //Add first row with today date
        const dateToPrint = new Date();
        const dateToPrintString = `${dateToPrint.getMonth() + 1}/${dateToPrint.getDate()}/${dateToPrint.getFullYear()} ${dateToPrint.getHours().toString().padStart(2, '0')}:${dateToPrint.getMinutes().toString().padStart(2, '0')}`;
        worksheet.addRow([dateToPrintString]);
        const dateCell = worksheet.getCell(1, 1);
        dateCell.value = `${dateToPrintString}`;
        dateCell.font = { bold: false, size: 12 };
        dateCell.alignment = { vertical: 'bottom', horizontal: 'right' };
        worksheet.mergeCells(1, 1, 1, headers.length);

        //Add second row with project name
        const projectNameCell = worksheet.getCell(2, 1);
        projectNameCell.value = `Energy Model Analysis for: ${projectToUpdate.name}`;
        projectNameCell.font = { bold: true, size: 18 };
        projectNameCell.alignment = { vertical: 'middle', horizontal: 'center' };
        worksheet.mergeCells(2, 1, 2, headers.length);

        //Add empty row
        worksheet.addRow([]);

        //Add fourth row with headers
        const headersRow: string[] = headers.map(header => {
            return header.title;
        });
        worksheet.addRow(headersRow);

        const headerRow = worksheet.getRow(4);
        headerRow.eachCell((cell, _colNumber) => {
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
          cell.border = { bottom: { style: 'thin' } };
          cell.font = { bold: true };
          cell.value = cell.value?.toString().toUpperCase();
        });

        // Add the data
        fullDataSet.forEach((record: I_DataAnalyzed) => {
            worksheet.addRow(record);
        });

        workbook.views = [
            { x: 0, y: 0, width: 10000, height: 20000, firstSheet: 0, activeTab: workbook.worksheets.length > 1 ? 1 : 0,
              visibility: 'visible'}
        ];

        
        let user: IUserDocument = await getUserInfo(sessionToken);
        if (!user) {
            throw new Error('User not found');
        }
        return await saveFileInBucketInDBUpdateProject(projectId, workbook, projectToUpdate, user);
    } catch (error) {
        throw new Error(`Something went wrong generating the excel file: ${error}`);
    }
}

/**
 * Retrieves the headers for a table.
 * @returns An array of objects containing the id and title of each header.
 */
function getHeaders(): { id: string; title: any;}[] {
    return [
        { id: 'label', title: 'Label' },
        { id: 'dataInput', title: 'Data input Result' },
        { id: 'baselineInput', title: 'Baseline Result' },
        { id: 'proposedInput', title: 'Proposed Result' },
    ];
}

/**
 * Saves a file in the S3 Bucket, updates the project information in the database, and sends an email with the file.
 * 
 * @param projectId - The ID of the project.
 * @param workbook - The ExcelJS workbook to be saved in the S3 Bucket.
 * @param projectToUpdate - The project document to be updated in the database.
 * @param user - The user document associated with the project.
 * @returns A promise that resolves to a boolean indicating whether the file was successfully saved.
 * @throws An error if there is an issue saving the file in the S3 Bucket.
 */
async function saveFileInBucketInDBUpdateProject(projectId: string, workbook: ExcelJS.Workbook, projectToUpdate: IProjectDocument,
                                                 user: IUserDocument): Promise<boolean> {
    try {
        const check = await checkBucket();
        if (check.response !== 200) {
            throw new Error('Error saving output file in Bucket');
        }

        const fileToDelete = await ProjectFile.findById(projectToUpdate.outputFile);
        if (fileToDelete) {
            await deleteFileFromS3(check.s3, fileToDelete._id);
        }

        const dateToName = new Date().getTime();
        const buffer = await workbook.xlsx.writeBuffer();

        console.log(`Generated buffer size: ${buffer.byteLength} bytes`);
  
        const params = {
            Bucket: config.drive.bucketName,
            Key: `Energy Model Analysis (${dateToName}) ${projectToUpdate.name}.xlsx`,
            Body: buffer,
            ContentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        };
  
        const uploadResult = await check.s3.upload(params).promise();
        const { Location: url } = uploadResult;
  
        const createdFile: I_ProjectFileCreate = {
            name: `Energy Model Analysis (${dateToName}) ${projectToUpdate.name}.xlsx`,
            from: 'output',
            size: buffer.byteLength,
            type: 'xlsx',
            url: url,
            fileResult: undefined,
        };
  
        const fileCreated = await createProjectFile(createdFile);
  
        await sendMailWithExcelFile(projectToUpdate, user, url, dateToName, buffer);
  
        projectToUpdate.updatedAt = new Date();
        projectToUpdate.status = ProjectStatus.FINISHED;
        projectToUpdate.outputFile = fileCreated._id;

        await updateProjectById(projectId, projectToUpdate);
        return true;
    } catch (error) {
        throw new Error(`Something went wrong saving file in S3 Bucket: ${error}`);
    }
}

/**
 * Sends an email with an Excel file attachment.
 * 
 * @param projectToUpdate - The project document to update.
 * @param user - The user document.
 * @param url - The URL to include in the email.
 * @param dateToName - The date to include in the file name.
 * @param fileData - The Excel file data.
 * @throws Error if something goes wrong while sending the email.
 */
async function sendMailWithExcelFile(projectToUpdate: IProjectDocument, user: IUserDocument, url: string,
                                     dateToName: number, fileData: ExcelJS.Buffer) {
  try {
      const fileBuffer = Buffer.from(fileData);
      await transporter.sendMail({
          from: config.smtp.sender,
          to: 'nmarin@walkerreid.com',
          cc: 'developer@walkerreid.com',
          subject: `Energy Model Analysis for project ${projectToUpdate.name} by ${user.displayName} - ${user.email}`,
          html: `<b>Please click on the following link or paste this into your browser to view the Energy Model Analysis created for project ${projectToUpdate.name} by ${user.displayName} - ${user.email}:</b>
                  <a href="${url}">${url}</a>`,
          attachments: [
            {
              filename: `Energy Model Analysis (${dateToName}) ${projectToUpdate.name}.xlsx`,
              content: fileBuffer,
            },
          ],
      });
  } catch (err) {
      throw new Error(`Something went wrong while sending email: ${err}`);
  }
}

export { generateExcel };