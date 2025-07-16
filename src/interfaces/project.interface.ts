import { ScheduleType } from "constants/enums";
import { IProjectFileResult } from "../models/project-file.model";

/**
 * Represents the data structure for creating a project.
 */
interface ProjectCreate {
    projectId: string;
    name: string;
    description: string;
    zipCode: number;
    area: number;
    numberFloors: number;
    ashrae: string;
    buildingType: string;
    hvacHeatingType: string;
    coolingSqFtTon: number;
    heatingBTUSqFt: number;
}

/**
 * Represents the fields used for comparison in a project.
 */
interface I_CompareFields {
    ashrae: string;
    zipCode: number;
    area: number;
    numberFloors: number;
    buildingType: string;
    hvacHeatingType: string;
    coolingSqFtTon: number;
    heatingBTUSqFt: number;
}

/**
 * Represents the fields to be shown in a project.
 */
class I_ShowFields {
    location!: string;
    electricRates!: string;
    gasRates!: string;
    airSide!: string;
    cooling!: string[];
    heating!: string[];
    economizer!: string;
    lighting!: string[];
    envelope!: I_Envelope;
    occupancyAssumption!: I_OccupancyAssumption;

    constructor() {
        this.location = '-';
        this.electricRates = '-';
        this.gasRates = '-';
        this.airSide = '-';
        this.cooling = [];
        this.heating = [];
        this.economizer = '-';
        this.lighting = [];
        this.envelope = {
            roof: '-',
            wall: '-',
            floor: '-',
            windowSHGC: '-',
            windowSC: '-',
            windowUValue: '-',
            skylight: '-',
            door: '-'
        };
        this.occupancyAssumption = {
            name: 'ALL OTHERS',
            peoplePer1000SF: 10,
            areaPerPerson: 100,
            sensibleHeatPerPerson: 250,
            latentHeatPerPerson: 200,
            receptacleLoadWPerSf: 1,
            equestBuildingType: ["COMMUNITY CENTER", "CONFERENCE", "CONVENTION CENTER", "HEALTH", "HOSPITAL", "MUSEUM", "RETAIL", "DEPARTMENT STORE", "LARGE SINGLE STORY", "STAND-ALONE STORY", "SINGLE STOREFRONT", "STRIP MALL", "SERVICE STATION", "CONVENTION STORE", "WAREHOUSE SALES", "UNKNOWN, CUSTOM OR MIXED USE"],
            equestSpaceType: ["CONVENTION, MEETING CTR, EXERCISING CENTER", "GYM", "EXHIBIT DISPLAY", "MUSEUM", "RETAIL", "WHOLESALE SHOWRM"]
        };
    }
}

/**
 * Represents the envelope of a project.
 */
interface I_Envelope {
    roof: string;
    wall: string;
    floor: string;
    windowSHGC: string;
    windowSC: string;
    windowUValue: string;
    skylight: string;
    door: string;
}

class I_OccupancyAssumption {
    name!: string;
    peoplePer1000SF!: number;
    areaPerPerson!: number;
    sensibleHeatPerPerson!: number;
    latentHeatPerPerson!: number;
    receptacleLoadWPerSf!: number;
    equestBuildingType!: string[];
    equestSpaceType!: string[];

    constructor() {
        this.name = 'ALL OTHERS';
        this.peoplePer1000SF = 10;
        this.areaPerPerson = 100;
        this.sensibleHeatPerPerson = 250;
        this.latentHeatPerPerson = 200;
        this.receptacleLoadWPerSf = 1;
        this.equestBuildingType = ["COMMUNITY CENTER", "CONFERENCE", "CONVENTION CENTER", "HEALTH", "HOSPITAL", "MUSEUM", "RETAIL", "DEPARTMENT STORE", "LARGE SINGLE STORY", "STAND-ALONE STORY", "SINGLE STOREFRONT", "STRIP MALL", "SERVICE STATION", "CONVENTION STORE", "WAREHOUSE SALES", "UNKNOWN, CUSTOM OR MIXED USE"];
        this.equestSpaceType = ["CONVENTION, MEETING CTR, EXERCISING CENTER", "GYM", "EXHIBIT DISPLAY", "MUSEUM", "RETAIL", "WHOLESALE SHOWRM"];
    }
}

/**
 * Represents the interface for creating a project file.
 */
interface I_ProjectFileCreate {
    name: string;
    from: string;
    size: number;
    type: string;
    url: string;
    fileResult: IProjectFileResult | undefined;
}

/**
 * Represents the analyzed data for a project.
 */
interface I_DataAnalyzed {
    source: string;
    label: string;
    dataInput: string;
    baselineInput: string;
    proposedInput: string;
}

/**
 * Represents the header of a project.
 */
interface Header {
    [key: string]: any[];
}

/**
 * Represents a polygon object with string keys and string values.
 */
type PolygonObject = { [key: string]: string };

/**
 * Represents the result of a project file.
 */
class I_ProjectFileResult {
    shadingCoefficient!: string;
    glassConductance!: string;
    wallUnitValue!: string;
    roofUnitValue!: string;
    doorUnitValue!: string;
    floorUnitValue!: string;
    lpd!: number[];
    electricRate!: string;
    gasRate!: string;
    hvacTypes!: any[];
    coolingEIR!: any[];
    heatingEIR!: any[];
    chillerEIR!: any[];
    capacityRatios!: any[];
    heatInputRatios!: any[];
    hasEconomizer!: boolean;
    area!: string;
    schedules!: string;
    multipliers!: any[];
    latentHeatPerPerson: string;
    sensibleHeatPerPerson: string;
    receptacleLoadWPerSf: string;
    areaPerPerson: string;

    constructor() {
        this.shadingCoefficient = '';
        this.glassConductance = '';
        this.wallUnitValue = '';
        this.roofUnitValue = '';
        this.doorUnitValue = '';
        this.floorUnitValue = '';
        this.lpd = [];
        this.electricRate = '';
        this.gasRate = '';
        this.hvacTypes = [];
        this.coolingEIR = [];
        this.heatingEIR = [];
        this.chillerEIR = [];
        this.capacityRatios = [];
        this.heatInputRatios = [];
        this.hasEconomizer = false;
        this.area = '';
        this.schedules = ScheduleType.N2_5_NONRESIDENTIAL;
        this.multipliers = [];
        this.latentHeatPerPerson = '';
        this.sensibleHeatPerPerson = '';
        this.receptacleLoadWPerSf = '';
        this.areaPerPerson = '';
    }
}

/**
 * Represents the data structure for a zip code.
 */
class I_ZipCodeData {
    ZIP!: number;
    STCOUNTYFP!: string;
    CITY!: string;
    STATE!: string;
    COUNTYNAME!: string;
    CLIMATEZONE!: string;

    constructor(zip: any) {
        this.ZIP = Number.parseInt(zip.zip) || 0;
        this.STCOUNTYFP = zip.stCountyFp || '';
        this.CITY = zip.city || '';
        this.STATE = zip.state || '';
        this.COUNTYNAME = zip.countyName || '';
        this.CLIMATEZONE = zip.climateZone || '';
    }
}

/**
 * Represents a point in a two-dimensional vector space.
 */
type VectorPoint = {
    x: number;
    y: number;
};

export { I_ZipCodeData, I_ProjectFileResult, Header, I_DataAnalyzed, I_ProjectFileCreate, I_Envelope, I_ShowFields,
         I_CompareFields, ProjectCreate, VectorPoint, PolygonObject, I_OccupancyAssumption }