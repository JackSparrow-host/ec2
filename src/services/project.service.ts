import _ from 'underscore';

import { AshraeType, BuildingType, HvacHeatingType, ProjectStatus, Role, ScheduleType } from '../constants/enums';
import { I_CompareFields, I_ZipCodeData, ProjectCreate } from '../interfaces/project.interface';
import { getUserInfo } from '../middleware/authentication.middleware';
import { CompareFields } from '../models/compare-fields.model';
import { IProjectDocument, Project } from '../models/project.model';
import { IUserDocument } from '../models/user.model';
import { ZipCodeData, getZipCodeDataByZipCode } from '../models/zip-code-data.model';
import { Envelope, IOccupancyAssumption, OccupancyAssumption, ShowFields } from '../models/show-fields.model';
import { getLpdDataByType } from '../models/lpd-data.model';
import { getCoolEff, getHeatEff } from '../services/calculate-efficiency.service';
import { getSystemDataByNumber } from '../models/system-data.model';
import { getRateDataByState } from '../models/rate-data.model';
import { getHvacData } from '../models/hvac-data.model';
import { getShutOffDataByZone } from '../models/shutOff-data.model';
import { getEnvelopeDataByZoneAndResidential } from '../models/envelop-data.model';

/**
 * Retrieves all projects from the database.
 * @returns A promise that resolves to an array of project documents.
 * @throws An error if there was a problem retrieving the projects.
 */
async function getProjectsService(sessionToken: string): Promise<IProjectDocument[]> {
    try {
        const user = await getUserInfo(sessionToken);
        
        if (!user) {
            throw new Error('User not found');
        }

        const query = {};// user.role === Role.ADMIN ? {} : { createdBy: user._id };
        const projects = await Project.find(query).populate('baselineInput').populate('proposedInput')
                                             .populate('outputFile').populate('createdBy')
                                             .populate('fieldsToCompare').populate('fieldsToShow').exec();
        return projects;
    } catch (error) {
        throw new Error ('Error retrieving projects: ' + error);
    }
}

/**
 * Retrieves a project by its ID.
 * @param projectId - The ID of the project to retrieve.
 * @returns A promise that resolves to the retrieved project.
 * @throws If the project is not found or an error occurs during retrieval.
 */
async function getProjectService(projectId: string): Promise<IProjectDocument> {
    try {
        const project = await Project.findById(projectId).populate('baselineInput').populate('proposedInput')
                                     .populate('outputFile').populate('createdBy')
                                     .populate('fieldsToCompare').populate('fieldsToShow').exec();
        
        if (!project) {
            throw new Error('Project not found');
        }
        return project;
    } catch (error) {
        throw new Error ('Error retrieving project: ' + error);
    }
}

/**
 * Adds project data to the database.
 * 
 * @param projectData - The project data to be added.
 * @param sessionToken - The session token for authentication.
 * @returns A promise that resolves to the newly created project document.
 * @throws An error if there is an issue adding the project data.
 */
async function addProjectDataService(projectData: ProjectCreate, sessionToken: string): Promise<IProjectDocument> {
    try {
        const user = await getUserInfo(sessionToken);
                
        if (!user) {
            throw new Error('User not found');
        }

        const fields = new CompareFields({
            ashrae: projectData.ashrae as AshraeType,
            zipCode: projectData.zipCode,
            area: projectData.area,
            numberFloors: projectData.numberFloors,
            buildingType: projectData.buildingType as BuildingType,
            hvacHeatingType: projectData.hvacHeatingType as HvacHeatingType,
            coolingSqFtTon: projectData.coolingSqFtTon,
            heatingBTUSqFt: projectData.heatingBTUSqFt,
        });

        await fields.save();

        const baseline = await analyzeBaseline(fields);
        if (!baseline) {
            throw new Error('Error analyzing baseline');
        }

        const occupancyAssumptions = await OccupancyAssumption.find().exec();
        const occupancy = await getOccupancyAssumption(occupancyAssumptions, projectData.buildingType as BuildingType);

        if (!occupancy) {
            throw new Error('No occupancy assumption found');
        }

        const showFields = new ShowFields({
            location: baseline.Location,
            area: `${projectData.area.toString()} SqFt`,
            scheduleType: getScheduleTypeByBuildingType(projectData.buildingType),
            electricRates: baseline.Rates.Electric,
            gasRates: baseline.Rates.Gas,
            airSide: baseline.hvacDesc,
            cooling: `${baseline.cooling.techType}, ${baseline.cooling.desc}: ${baseline.cooling.capacity}, ${baseline.cooling.EIR} EIR`,
            heating: `${baseline.heating.techType}, ${baseline.heating.desc}: ${baseline.heating.capacity}, ${baseline.heating.effRate} AFUE`,
            economizer: baseline.Economizer,
            lighting: baseline.LPD,
            envelope: new Envelope({
                roof: baseline.envelope.Roof,
                wall: baseline.envelope.Wall,
                floor: baseline.envelope.Floor,
                windowSHGC: baseline.envelope.WindowSHGC,
                windowSC: baseline.envelope.WindowSC,
                windowUValue: baseline.envelope.WindowUValue,
                skylight: baseline.envelope.Skylight,
                door: baseline.envelope.Door,
                residential: baseline.envelope.residential,
            }),
            occupancyAssumptions: new OccupancyAssumption({
                name: occupancy!.name,
                peoplePer1000SF: occupancy!.peoplePer1000SF,
                areaPerPerson: occupancy!.areaPerPerson,
                sensibleHeatPerPerson: occupancy!.sensibleHeatPerPerson,
                latentHeatPerPerson: occupancy!.latentHeatPerPerson,
                receptacleLoadWPerSf: occupancy!.receptacleLoadWPerSf,
                equestBuildingType: occupancy!.equestBuildingType,
                equestSpaceType: occupancy!.equestSpaceType
            })
        });

        await showFields.save();

        const newProject = new Project({
            projectId: projectData.projectId,
            name: projectData.name,
            description: projectData.description,
            status: ProjectStatus.STARTED,
            createdAt: new Date(),
            updatedAt: new Date(),
            createdBy: user ? user._id : '',
            fieldsToCompare: fields,
            fieldsToShow: showFields,
        });

        const result = await newProject.save();

        return result;
    } catch (error) {
        throw new Error ('Error adding project data: ' + error);
    }
}

/**
 * Edits a project in the project service.
 * 
 * @param projectId - The ID of the project to edit.
 * @param projectData - The updated project data.
 * @param sessionToken - The session token for authentication.
 * @returns A promise that resolves to the edited project document.
 * @throws An error if the project or required fields are not found, or if there is an error analyzing the baseline.
 */
async function editProjectService(projectId: string, projectData: ProjectCreate, sessionToken: string)
                                  : Promise<IProjectDocument> {
    try {
        
        const projectExist = await Project.findById(projectId);
            if (!projectExist) {
            throw new Error('Project not found');
        }

        let fieldsToShow = await ShowFields.findById(projectExist.fieldsToShow);
        if (!fieldsToShow) {
            throw new Error('Fields To Show not found');
        }

        const fieldsToCompare = await CompareFields.findById(projectExist.fieldsToCompare);

        if (!fieldsToCompare) {
            throw new Error('Fields To Compare not found');
        }

        let user: IUserDocument | undefined;
        if (sessionToken !== '') {
            user = await getUserInfo(sessionToken);
        }

        fieldsToCompare.ashrae = projectData.ashrae as AshraeType;
        fieldsToCompare.zipCode = projectData.zipCode;
        fieldsToCompare.area = projectData.area;
        fieldsToCompare.numberFloors = projectData.numberFloors;
        fieldsToCompare.buildingType = projectData.buildingType as BuildingType;
        fieldsToCompare.hvacHeatingType = projectData.hvacHeatingType as HvacHeatingType;
        fieldsToCompare.coolingSqFtTon = projectData.coolingSqFtTon;
        fieldsToCompare.heatingBTUSqFt = projectData.heatingBTUSqFt;

        await fieldsToCompare.save();

        const baseline = await analyzeBaseline(fieldsToCompare);
        if (!baseline) {
            throw new Error('Error analyzing baseline');
        }
        
        const occupancyAssumptions = await OccupancyAssumption.find().exec();
        const occupancy = await getOccupancyAssumption(occupancyAssumptions, projectData.buildingType as BuildingType);

        fieldsToShow.location = baseline.Location;
        fieldsToShow.area = `${projectData.area.toString()} Sqft`;        
        fieldsToShow.schedules = getScheduleTypeByBuildingType(projectData.buildingType);
        fieldsToShow.electricRates = baseline.Rates.Electric;
        fieldsToShow.gasRates = baseline.Rates.Gas;
        fieldsToShow.airSide = baseline.hvacDesc;
        fieldsToShow.cooling = [`${baseline.cooling.techType}, ${baseline.cooling.desc}: ${baseline.cooling.capacity}, ${baseline.cooling.EIR} EIR`];
        fieldsToShow.heating = [`${baseline.heating.techType}, ${baseline.heating.desc}: ${baseline.heating.capacity}, ${baseline.heating.effRate} AFUE`];
        fieldsToShow.economizer = baseline.Economizer;
        fieldsToShow.lighting = [baseline.LPD];
        fieldsToShow.envelope = new Envelope({
            roof: baseline.envelope.Roof,
            wall: baseline.envelope.Wall,
            floor: baseline.envelope.Floor,
            windowSHGC: baseline.envelope.WindowSHGC,
            windowSC: baseline.envelope.WindowSC,
            windowUValue: baseline.envelope.WindowUValue,
            skylight: baseline.envelope.Skylight,
            door: baseline.envelope.Door,
            residential: baseline.envelope.residential,
        });
        fieldsToShow.occupancyAssumption = new OccupancyAssumption({
            name: occupancy!.name,
            peoplePer1000SF: occupancy!.peoplePer1000SF,
            areaPerPerson: occupancy!.areaPerPerson,
            sensibleHeatPerPerson: occupancy!.sensibleHeatPerPerson,
            latentHeatPerPerson: occupancy!.latentHeatPerPerson,
            receptacleLoadWPerSf: occupancy!.receptacleLoadWPerSf,
            equestBuildingType: occupancy!.equestBuildingType,
            equestSpaceType: occupancy!.equestSpaceType
        });
        await fieldsToShow.save();

        projectExist.name = projectData.name;
        projectExist.description = projectData.description;
        projectExist.updatedAt = new Date();
        projectExist.createdBy = user ? user._id : '';
        projectExist.fieldsToCompare = fieldsToCompare._id;
        projectExist.fieldsToShow = fieldsToShow._id;

        const result = await projectExist.save();

        return result;
    } catch (error) {
        throw new Error ('Error editing project: ' + error);
    }
}

/**
 * Busca el OccupancyAssumption correspondiente basado en el buildingType.
 * Acepta coincidencias parciales dentro de los arreglos.
 * @param occupancyAssumptions - Lista de ocupaciones.
 * @param buildingType - Tipo de edificio a buscar.
 * @returns OccupancyAssumption encontrado o `null` si no hay coincidencia.
 */
async function getOccupancyAssumption(
    occupancyAssumptions: IOccupancyAssumption[],
    buildingType: string
): Promise<IOccupancyAssumption | null> {
    let occupancy = _.find(occupancyAssumptions, (occupancy: IOccupancyAssumption) =>
        occupancy.equestBuildingType.some(type => type.includes(buildingType))
    );

    if (!occupancy) {
        occupancy = _.find(occupancyAssumptions, (occupancy: IOccupancyAssumption) =>
            occupancy.equestSpaceType.some(type => type.includes(buildingType))
        );
    }

    if (!occupancy) {
        occupancy = _.find(occupancyAssumptions, (occupancy: IOccupancyAssumption) =>
            occupancy.name === 'ALL OTHERS'
        );
    }

    return occupancy || null;
}


/**
 * Deletes a project by its ID.
 * 
 * @param projectId - The ID of the project to delete.
 * @returns A promise that resolves to a boolean indicating whether the project was deleted successfully.
 * @throws If the project or any related fields are not found, or if there is an error deleting the project.
 */
async function deleteProjectService(projectId: string): Promise<boolean> {
    try {
        const projectToDelete = await Project.findById(projectId);        
        if (!projectToDelete) {
            throw new Error('Project not found');
        }

        const fieldsToShowToDelete = await ShowFields.findById(projectToDelete.fieldsToShow);
        if (!fieldsToShowToDelete) {
            throw new Error('Fields To Show not found');
        }

        const fieldsToCompareToDelete = await CompareFields.findById(projectToDelete.fieldsToCompare);
        if (!fieldsToCompareToDelete) {
            throw new Error('Fields To Compare not found');
        }

        await Project.findByIdAndDelete(projectId);

        await ShowFields.findByIdAndDelete(projectToDelete.fieldsToShow);

        await CompareFields.findByIdAndDelete(projectToDelete.fieldsToCompare);

        return true
    } catch (error) {
        throw new Error ('Error deleting project: ' + error);
    }
}

/**
 * Analyzes the baseline for a given set of fields.
 * @param fieldsToCompare - The fields to compare for the baseline analysis.
 * @returns The analysis result including location, rates, economizer, HVAC details, LPD, and envelope.
 * @throws If there is an error analyzing the baseline.
 */
async function analyzeBaseline(fieldsToCompare: I_CompareFields) {
    try {
      const zipCodeData = await getZipCodeDataByZipCode(fieldsToCompare.zipCode);

      if (zipCodeData) {        
          const location = `${zipCodeData.CITY}-${zipCodeData.STATE}`;
          const rates = await getRates(zipCodeData.STATE, fieldsToCompare.buildingType);
          const economizer = await getEconomizer(zipCodeData.CLIMATEZONE);
          const hvac = await getHvac(fieldsToCompare.buildingType, fieldsToCompare.hvacHeatingType,
                              fieldsToCompare.numberFloors, fieldsToCompare.area, fieldsToCompare.coolingSqFtTon,
                              fieldsToCompare.heatingBTUSqFt);
          const lpd = await getLPD(fieldsToCompare.buildingType);
          const envelope = await getEnvelope(zipCodeData.CLIMATEZONE, fieldsToCompare.buildingType);

          var fullResp = {
              Location: location, Rates: rates, Economizer: economizer, hvacDesc: hvac.hvacDesc,
              hvacId: hvac.hvacID, cooling: hvac.cooling, heating: hvac.heating, LPD: lpd,
              envelope: envelope,
          };
          return fullResp;
      }
    } catch (error) {
        throw new Error ('Error analyzing baseline: ' + error);
    }
}

/**
 * Retrieves the rates for electricity and gas based on the specified state and building type.
 * @param state - The state for which to retrieve the rates.
 * @param buildingType - The type of building (e.g., "MULTI-FAMILY", "COMMERCIAL").
 * @returns A promise that resolves to an object containing the electricity and gas rates.
 * @throws An error if there is an issue retrieving the rates.
 */
async function getRates(state: string, buildingType: string): Promise<{ Electric: string; Gas: string; }> {
    try {
      let rate = await getRateDataByState(state);
      let rateObject = {
          Electric: `${buildingType === 'MULTI-FAMILY' ? rate?.Residential_Electric : rate?.Commercial_Electric} ¢/kW-hr`,
          Gas: `${buildingType === 'MULTI-FAMILY' ? rate?.Residential_Gas : rate?.Commercial_Gas } $/therm`,
      };
      
      return rateObject;
    } catch (error) {
        throw new Error ('Error retrieving rates: ' + error);
  }
}

/**
 * Retrieves the economizer information based on the climate zone.
 * @param climateZone - The climate zone for which to retrieve the economizer information.
 * @returns A Promise that resolves to a string representing the economizer information.
 * @throws An error if there is an issue retrieving the economizer information.
 */
async function getEconomizer(climateZone: string): Promise<string> {
  try {
    const noEconomizerZones = ['1A', '1B', '2A', '3A', '4A'];
  
    if (noEconomizerZones.includes(climateZone)) {
      return `${climateZone}: No economizer is required`;
    } else {
      const shutOff = await getShutOffDataByZone(climateZone);
      return `${climateZone}: requires economizer with high limit shutOff of ${shutOff?.temp}°F`;
    }
  } catch (error) {
      throw new Error ('Error retrieving economizer: ' + error);
  }
}

/**
 * Retrieves HVAC information based on the provided parameters.
 * @param buildingType - The type of building.
 * @param heat - The type of heating system.
 * @param noFloors - The number of floors in the building.
 * @param area - The area of the building.
 * @param coolRate - The cooling rate.
 * @param heatRate - The heating rate.
 * @returns A promise that resolves to an object containing HVAC description, ID, cooling, and heating information.
 * @throws An error if there is an issue retrieving the HVAC information.
 */
async function getHvac(buildingType: string, heat: string, noFloors: number, area: number, coolRate: number, 
                 heatRate: number): Promise<{ hvacDesc: string, hvacID: number, cooling: any, heating: any }> {
    try {
        const hvacData = await getHvacData();
        let hvacID = 0;
        let hSystem = 0;
        let systemDescription: any;
        if (buildingType === 'MULTI-FAMILY') {
          systemDescription = heat === 'FOSSIL FUEL'
                    ? await getSystemDataByNumber(1)
                    : await getSystemDataByNumber(2)
        } else {
            if (noFloors <= 3 && area < 25000) {
                hvacID = 1;
              } else if (noFloors <= 5 && area < 25000) {
                hvacID = 2;
              } else if (noFloors <= 5 && area <= 150000) {
                hvacID = 3;
              } else if (noFloors > 5 || area > 150000) {
                hvacID = 4;
              } else {
                console.log('error');
              }

              hSystem = heat === 'FOSSIL FUEL' ? hvacData[hvacID].ff : hvacData[hvacID].electric;     
              systemDescription = await getSystemDataByNumber(hSystem);     
        }

        const hvacDesc = systemDescription?.systemType || '';
        const systemID = systemDescription.number || 0;
        const cooling = getCoolEff(area, systemID, coolRate);
        const heating = getHeatEff(area, systemID, heatRate);

        return { hvacDesc: hvacDesc, hvacID: systemID, cooling: cooling, heating: heating};
    } catch (error) {
      throw new Error ('Error retrieving hvac: ' + error);
  }
}

/**
 * Retrieves the LPD (Lighting Power Density) for a given building type.
 * @param buildingType - The type of building.
 * @returns A Promise that resolves to the LPD value in the format "{LPD} W/SqFt" if successful, or an error message if unsuccessful.
 * @throws If there is an error retrieving the LPD.
 */
async function getLPD(buildingType: string): Promise<string> {
  try {
    const bLPD = await getLpdDataByType(buildingType);

    if (bLPD) {
      return `${bLPD.lpd.toFixed(1)} W/SqFt`;
    } else {
      return 'Error retrieving LPD';
    }
  } catch (error) {
      throw new Error ('Error retrieving LPD: ' + error);
  }
}

/**
 * Retrieves the envelope data for a given zone.
 * @param zone - The zone identifier.
 * @returns A promise that resolves to an object containing the envelope data.
 *          The object has the following properties:
 *          - Roof: The roof material.
 *          - Wall: The wall material.
 *          - Floor: The floor material.
 *          - WindowUValue: The U-value of the window.
 *          - WindowSHGC: The solar heat gain coefficient of the window.
 *          - Skylight: The skylight material.
 * @throws If there is an error retrieving the envelope data.
 */
async function getEnvelope(zone: string, buildingType: string)
                                            : Promise<{Roof: string; Wall: string; Floor: string; WindowUValue: string;
                                                       WindowSHGC: string; WindowSC: string; Skylight: string; Door: string, residential: boolean}> {
    try {
      const idResidential = buildingType === 'MULTI-FAMILY';
      const zoneNumber = Number.parseInt(zone.slice(0, 1));
      var envelope = await getEnvelopeDataByZoneAndResidential(zoneNumber, idResidential);
    
      return {
        Roof: envelope?.Roof || '',
        Wall: envelope?.Wall || '',
        Floor: envelope?.Floor || '',
        WindowUValue: envelope?.Window || '',
        WindowSHGC: envelope?.SHGC || '',
        WindowSC: envelope?.SC || '',
        Skylight: envelope?.Skylight || '',
        Door: envelope?.Door || '',
        residential: idResidential
      };
    } catch (error) {
      throw new Error ('Error retrieving envelop: ' + error);
    }
}

/**
 * Retrieves the zip code data for a given zip code.
 * @param zipCode The zip code to retrieve data for.
 * @returns A promise that resolves to the zip code data.
 * @throws If the zip code is not found.
 */
async function getZipCodeData(zipCode: number): Promise<I_ZipCodeData> {
    try {
        const zipCodeData = await getZipCodeDataByZipCode(zipCode);

        if (!zipCodeData) {
            throw new Error('Zip code not found');
        } else {
            return zipCodeData;
        }
    } catch (error) {        
        throw new Error ('Zip code not found: ' + error);
    }
}

/**
 * Adds a new zip code data to the database.
 * 
 * @param zipCode - The zip code data to be added.
 * @returns A promise that resolves to the added zip code data.
 * @throws If the zip code already exists or if an error occurs during the process.
 */
async function addZipCodeData(zipCode: I_ZipCodeData): Promise<I_ZipCodeData> {
    try {
        const existZipCode = await getZipCodeDataByZipCode(zipCode.ZIP);
        if (existZipCode) {
            throw new Error(`Zip Code ${zipCode.ZIP} already exist`);
        }

        const zipCodeToAdd = new ZipCodeData({ 
            ZIP: zipCode.ZIP,
            STCOUNTYFP: zipCode.STCOUNTYFP,
            CITY: zipCode.CITY,
            STATE: zipCode.STATE,
            COUNTYNAME: zipCode.COUNTYNAME,
            CLIMATEZONE: zipCode.CLIMATEZONE
        });

        await zipCodeToAdd.save();

        return zipCodeToAdd;
    } catch (error) {        
        throw new Error ('Zip code not found: ' + error);
    }
}

/**
 * Retrieves the schedule type based on the building type.
 * @param buildingType The type of the building.
 * @returns The schedule type corresponding to the building type.
 */
function getScheduleTypeByBuildingType(buildingType: string): ScheduleType {
    switch (buildingType) {
        case 'RETAIL': {
            return ScheduleType.N2_9_RETAIL;
        }
        case 'HOTEL':
        case 'MOTEL':
        {
            return ScheduleType.N2_6_HOTEL_FUNCTION;
        }
        case 'DORMITORY': 
        case 'MULTI-FAMILY': {
            return ScheduleType.N2_7_RESIDENTIAL_WITH_SETBACK;
        }
        default: {
            return ScheduleType.N2_5_NONRESIDENTIAL;
        }
    }
}

export { getProjectsService, getProjectService, addProjectDataService, editProjectService,
         deleteProjectService, getZipCodeData, addZipCodeData };
