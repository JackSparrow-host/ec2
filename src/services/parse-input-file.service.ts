import _ from 'underscore';

import { I_ProjectFileResult, Header, VectorPoint, PolygonObject, I_OccupancyAssumption } from '../interfaces/project.interface';

/**
 * Parses the input file and extracts the headers.
 * 
 * @param lines - An array of strings representing the lines of the input file.
 * @returns An array of Header objects containing the parsed headers.
 * @throws Error if there is an error parsing the file.
 */
function parseInpFile(lines: string[]): Header[] {
    try {
        let headers: Header[] = [];
        let lineCounter: number = 0;
        let nextLineIsHeader: boolean = false;
        let nextLineIsAfterHeader: boolean = false;
        let lastHeaderName: string = '';
        let linesInsideHeader: any[] = [];
        let workingInLinesInsideHeader: boolean = false;
        let header: Header = {};

        _.forEach(lines, (line: string) => {
            lineCounter++;
            if (lineCounter === 1 && line.includes('INPUT ..\r')) {
                lastHeaderName = line.replace(/^\$+/, '').replace('..', '').trim();
                header[lastHeaderName] = [];
                headers.push(header);
            }
            if (line.includes('$ -') && !nextLineIsAfterHeader) {
                // Línea de inicio de encabezado
                if (workingInLinesInsideHeader) {
                    // Si hay un cuerpo dentro de un encabezado (Versión 1)
                    const convertJsonResult = convertToJSON(linesInsideHeader);
                    header[lastHeaderName] = convertJsonResult;
                    linesInsideHeader = [];
                    workingInLinesInsideHeader = false;
                }
                nextLineIsHeader = true;
                return;
            }
            if (nextLineIsHeader) {
                // Tratamiento de línea de encabezado
                lastHeaderName = line.replace(/^\$+/, '').trim();
                header = {};
                header[lastHeaderName] = [];
                headers.push(header);
                nextLineIsHeader = false;
                nextLineIsAfterHeader = true;
                return;
            }
            if (line.includes('$ -') && nextLineIsAfterHeader) {
                // Línea de final de encabezado
                nextLineIsAfterHeader = false;
                return;
            }
            if (lineCounter !== 1 && !line.includes('$ -') && !nextLineIsAfterHeader && !nextLineIsHeader) {
                // Líneas del cuerpo de un encabezado
                if (line.includes('= {')){
                    line = transformString(line);
                }
                workingInLinesInsideHeader = true;
                linesInsideHeader.push(line);
            }
        });

        return headers;
    } catch (e) {
        throw new Error(`Error parsing file ${e}`);
    }
}

/**
 * Converts an array of lines inside a header to JSON format.
 * @param linesInsideHeader - The array of lines inside the header.
 * @returns An array of JSON objects.
 * @throws Error if there is an error converting to JSON.
 */
function convertToJSON(linesInsideHeader: any[]): any[] {
  try {
    let recursiveLineCounter: number = 0;
    let jsonConverted: any = {};
    let jsonArray: any[] = [];
    let conversionLastHeaderName = '';
    let recursiveLastHeaderName = '';
    let key = '';
    let value = '';
    _.forEach(linesInsideHeader, (line: string) => {
        recursiveLineCounter++;
        if (!line.includes('=') && !line.includes('..\r') && !line.includes('$ ***') &&
            !linesInsideHeader[recursiveLineCounter].includes('..\r')) {
            const asterisk = line.replace(/\s+/g, '');
            if (asterisk.length >= 5 && /^\$[*]{4}$/.test(asterisk)) {
                return;
            } else {
                conversionLastHeaderName = line.replace('\r', '').replace(/[\s*$]+/g, '');
                jsonConverted[conversionLastHeaderName] = [];
            }
        } else if (line.includes('=')) {
            key = line.split('=')[0].replace(/'/g, '').replace('\r', '').trim();
            value = line.split('=')[1].trim().replace('\r', '');
            recursiveLastHeaderName = key;
            if (conversionLastHeaderName === '') {
                jsonConverted[key] = value;
            } else {
                jsonConverted[key] = value;
            }
        } else if (
            !line.includes('=') && !line.includes('..\r') && linesInsideHeader[recursiveLineCounter] !== undefined &&
            linesInsideHeader[recursiveLineCounter].includes('..\r')) {
            if (linesInsideHeader[recursiveLineCounter - 2].includes('..\r')) {
                key = line.replace(/'/g, '').replace('\r', '').trim();
                value = '';
                jsonConverted[key] = value;
            } else {
                let recursiveValue = jsonConverted[recursiveLastHeaderName];
                jsonConverted[recursiveLastHeaderName] = recursiveValue.concat(
                    deleteWhitespace(line)
                );
            }
        } else if (line.includes('..\r')) {
            jsonArray.push(jsonConverted);
            conversionLastHeaderName = '';
            recursiveLastHeaderName = '';
            jsonConverted = {};
            return;
        }
    });
    return jsonArray;
  } catch (e) {
    throw new Error(`Error converting to JSON ${e}`);
  }
}

/**
 * Deletes leading whitespace characters from a string.
 * 
 * @param str - The input string.
 * @returns The string with leading whitespace characters removed.
 * @throws If an error occurs while deleting whitespace.
 */
function deleteWhitespace(str: string): string {
  try {
    let i = 0;
    while (str[i] === ' ' && i < str.length - 1) {
        i++;
    }
    return str.slice(i).trim();
  } catch (error) {
      throw new Error ('Error deleting whitespace: ' + error);
  }

}

/**
 * Retrieves values from the input file data.
 * @param data The input file data.
 * @returns The result containing the extracted values.
 * @throws Error if there is an error while retrieving the values.
 */
function getInpValues(data: any[]) {
  let result = new I_ProjectFileResult();
  try {
    let relatedObj = _.filter(data, (header: any) => header['Misc Cost Related Objects']);
    if (relatedObj.length > 0) {
      extractMultiplePolygon(relatedObj, result);
    }
    _.forEach(data, (header: any) => {
      extractGlassData(header, result);
      extractMaterialsData(header, result);
      extractLightingData(header, result);
      extractUtilityRates(header, result);
      extractHVACData(header, result);
      extractChillersData(header, result);
      sumTotalPolygonArea(header, result);
      findSchedulesData(header, result);
      extractOccupancyAssumptions(header, result);
    });
    if (result.heatingEIR.length === 0 && result.heatInputRatios.length === 0) {
        let hvacSystemZonesObj = _.filter(data, (header: any) => header['Chilled Water Meters']);
        extractFurnance(hvacSystemZonesObj, result);
        extractHeatPump(hvacSystemZonesObj, result);
    }
    return result;
  } catch (e) {
    throw new Error(`Error getting values from inp file ${e}`);
  }
}

/**
 * Extracts glass data from the header object and updates the result object.
 * @param header - The header object containing glass types.
 * @param result - The result object to be updated with glass data.
 * @throws Error if there is an error extracting glass data.
 */
function extractGlassData(header: any, result: I_ProjectFileResult) {
  try {
    if (header['Glass Types']) {
      const glassTypes = header['Glass Types'];
      const baselineGlass = _.find(glassTypes, (item: any) => item.hasOwnProperty("\"Baseline Glass\""));
      if (baselineGlass) {
        result.shadingCoefficient = baselineGlass['SHADING-COEF'];
        result.glassConductance = baselineGlass['GLASS-CONDUCT'];
      }
    }
  } catch (e) {
    throw new Error(`Error extracting glass data ${e}`);
  }
}

/**
 * Calculates the sum of the total polygon area.
 * 
 * @param header - The header object containing polygon data.
 * @param result - The result object to store the calculated area.
 * @throws Error if there is an error extracting polygons data.
 */
function sumTotalPolygonArea(header: any, result: I_ProjectFileResult) {
    try {
        let sumTotal: number = 0.0;

        if (header['Polygons']) {
            const polygonVectors = header['Polygons'];

            const polygonsToAnalyze = findFloorPolygonObjects(polygonVectors);
            polygonsToAnalyze.forEach((polygonVector: any) => { 
                if (polygonVector) {
                    const floorPolygonName = getFloorPolygonName(polygonVector);
                    const vertexes = extractVectors(polygonVector);
                    let polygonArea = calculatePolygonArea(vertexes);

                    const floorPolygon = result.multipliers.find(fp => fp.POLYGON === floorPolygonName);
                    if (floorPolygon && floorPolygon.MULTIPLIER) {
                        polygonArea *= floorPolygon.MULTIPLIER;
                    }

                    sumTotal += polygonArea;                     
                }
            });
            sumTotal = Math.round(sumTotal);
            result.area = `${sumTotal.toString()} SqFt`;
        }
    } catch (e) {
        throw new Error(`Error extracting polygons data ${e}`);
    }
}

/**
 * Finds and extracts schedules data from the header object and populates the result object.
 * @param header - The header object containing the data to be analyzed.
 * @param result - The result object to store the extracted schedules data.
 * @throws Error if there is an error extracting the schedules data.
 */
function findSchedulesData(header: any, result: I_ProjectFileResult) {
    try {
        const uniqueValues: string[] = [];
        if (header['Misc Cost Related Objects']) {
            const keysToExtract = ["PEOPLE-SCHEDULE", "LIGHTING-SCHEDUL", "EQUIP-SCHEDULE", "INF-SCHEDULE"];
            const objects = header['Misc Cost Related Objects'];

            _.forEach(objects, (objectToAnalyze) => {
                _.forEach(keysToExtract, (key) => {
                    const value = objectToAnalyze[key];

                    if (value) {
                        const cleanValue = value.match(/"([^"]+)"/)?.[1] || value;
                        uniqueValues.push(cleanValue);
                    }
                });
            });
            result.schedules = _.uniq(uniqueValues).join(", ");
        }
    } catch (err) {
        throw new Error(`Error extracting schedules data ${err}`);
    }
}

/**
 * Finds and returns an array of PolygonObjects that represent floor polygons.
 * @param polygons - The array of PolygonObjects to search through.
 * @returns An array of PolygonObjects representing floor polygons.
 */
function findFloorPolygonObjects(polygons: PolygonObject[]): PolygonObject[] {
    const floorPolygonRegex = /Floor Polygon/;
    return polygons.filter(polygon => {
        return Object.keys(polygon).some(key => {
        return floorPolygonRegex.test(key);
        });
    });
}

function findFloorPolygonByName(polygons: PolygonObject[], floorName: String): PolygonObject[] {
    return polygons.filter(polygon => {
        return Object.keys(polygon).some(key => {
            const cleanKey = key.replace(/^"|"$/g, '');
            return cleanKey === floorName;
        });
    });
}

/**
 * Extracts materials data from the header object and updates the result object with the corresponding values.
 * @param header - The header object containing the materials data.
 * @param result - The result object to be updated with the extracted values.
 * @throws Error if there is an error extracting the materials data.
 */
function extractMaterialsData(header: any, result: I_ProjectFileResult) {
  try {
    if (header['Materials / Layers / Constructions']) {
        const wallProperties = ["\"Baseline Wall\"", "\"Proposed Wall\""];
        const roofProperties = ["\"Baseline Roof\"", "\"Proposed Roof\""];
        const doorProperties = ["\"Baseline Door\"", "\"Proposed Door\""];
        const florProperties = ["\"EL1 IFlr Construction\""]

        const materials = header['Materials / Layers / Constructions'];

        const baselineOrProposedWall = findItemWithProperties(materials, wallProperties);
        const baselineOrProposedRoof = findItemWithProperties(materials, roofProperties);
        const baselineOrProposedDoor = findItemWithProperties(materials, doorProperties);
        const baselineOrProposedFloor = findItemWithProperties(materials, florProperties);

        if (baselineOrProposedWall) {
            result.wallUnitValue = baselineOrProposedWall['U-VALUE'];
        }
        if (baselineOrProposedRoof) {
            result.roofUnitValue = baselineOrProposedRoof['U-VALUE'];
        }
        if (baselineOrProposedDoor) {
            result.doorUnitValue = baselineOrProposedDoor['U-VALUE'];
        }
        if (baselineOrProposedFloor){
            result.floorUnitValue = baselineOrProposedFloor['U-VALUE'] || 0;
        }
    }
  } catch (e) {
      throw new Error(`Error extracting materials data ${e}`);
  }
}

/**
 * Extracts lighting data from the header and populates the result object.
 * @param header - The header object containing the data.
 * @param result - The result object to be populated with the extracted data.
 * @throws {Error} If there is an error extracting the lighting data.
 */
function extractLightingData(header: any, result: I_ProjectFileResult) {
  try {
    const lightingWAreaValues: number[] = [];
    if (header['Misc Cost Related Objects']) {
        const miscObjects = header['Misc Cost Related Objects'];
        _.forEach(miscObjects, (item: any) => {
            if (item['LIGHTING-W/AREA']) {
                const numericValue = parseFloat(item['LIGHTING-W/AREA'].replace(/\(|\)/g, ''));
                if (!isNaN(numericValue) && !lightingWAreaValues.includes(numericValue)) {
                    lightingWAreaValues.push(numericValue);
                }
            }
        });
        result.lpd = lightingWAreaValues;
    }
  } catch (err) {
      throw new Error(`Error extracting lighting data ${err}`);
  }
}

/**
 * Extracts utility rates from the header object and updates the result object.
 * @param header - The header object containing utility rates.
 * @param result - The result object to be updated with extracted utility rates.
 * @throws Error if there is an error extracting utility rates.
 */
function extractUtilityRates(header: any, result: I_ProjectFileResult) {
    try {
      if (header['Utility Rates']) {
          const utilityRates = header['Utility Rates'];
          _.forEach(utilityRates, (item: any) => {
              const electricRate = item['ENERGY-CHG'] ? item['ENERGY-CHG'].replace(/}$/, '') : null;
              const gasRate = item['ENERGY-CHG'] ? item['ENERGY-CHG'].replace(/}$/, '') : null;
              
              if (item.hasOwnProperty("\"Electricity\"") || item.hasOwnProperty("\"Electricity Rate\"")) {
                  result.electricRate = electricRate;
              }
              if (item.hasOwnProperty("\"NG\"") || item.hasOwnProperty("\"Natural Gas\"") 
                  || item.hasOwnProperty("\"Natural Gas Rate\"")) {
                  result.gasRate = gasRate;
              }
          });
      }
    } catch (err) {
        throw new Error(`Error extracting utility rates: ${err}`);
    }
  }

/**
 * Extracts HVAC data from the header and updates the result object.
 * @param header - The header object containing the HVAC data.
 * @param result - The result object to be updated with the extracted HVAC data.
 * @throws Error if there is an error extracting the HVAC data.
 */
function extractHVACData(header: any, result: I_ProjectFileResult) {
  try {
    const hvacTypes: string[] = [];
    const coolEIR: number[] = [];
    const heatEIR: number[] = [];
    const capacityRatios: string[] = [];
    const heatInputRatios: string[] = [];
    const hwLoopValues: string[] = [];

    if (header['Chilled Water Meters']) {
        const chilledMeters = header['Chilled Water Meters'];
        _.forEach(chilledMeters, (item: any) => {
            if (item['TYPE']) {
                const typeValue = item['TYPE'];
                if (!hvacTypes.includes(typeValue)) {
                    hvacTypes.push(typeValue);
                }
            }
            if (item['HEAT-SOURCE']) {
                const heat_sourceValue = item['HEAT-SOURCE'];
                if (!hvacTypes.includes(heat_sourceValue)) {
                    hvacTypes.push(heat_sourceValue);
                }
            }
            if (item['CHW-LOOP']) {
                const chw_loopValue = item['CHW-LOOP'];
                if (!hvacTypes.includes(chw_loopValue)) {
                    hvacTypes.push(chw_loopValue);
                }
            }
            if (item['COOLING-EIR']) {
                const coolEIRValue = item['COOLING-EIR'];
                if (!isNaN(coolEIRValue) && !coolEIR.includes(coolEIRValue)) {
                    coolEIR.push(coolEIRValue);
                }
            }
            if (item['HEATING_EIR']) {
                const heatEIRValue = item['HEATING-EIR'];
                if (!isNaN(heatEIRValue) && !heatEIR.includes(heatEIRValue)) {
                    heatEIR.push(heatEIRValue);
                }
            }
            if (item['ECONO-LIMIT-T']) {
                result.hasEconomizer = true;
            }
        });
    }
    if (header['Boilers']) {
        const boiledMeters = header['Boilers'];
        _.forEach(boiledMeters, (item: any) => {
            if (item['TYPE']) {
                const boilerValue = item['TYPE'];
                if (!hvacTypes.includes(boilerValue)) {
                    hvacTypes.push(boilerValue);
                }
            }
            if (item['CAPACITY-RATIO']) {
                const capacityRatioValue = item['CAPACITY-RATIO'];
                if (!isNaN(parseFloat(capacityRatioValue)) && !capacityRatios.includes(capacityRatioValue)) {
                    capacityRatios.push(capacityRatioValue);
                }
            }
            if (item['HEAT-INPUT-RATIO']) {
                const heatInputRatio = item['HEAT-INPUT-RATIO'];
                if (!isNaN(parseFloat(heatInputRatio)) && !heatInputRatios.includes((1 / parseFloat(heatInputRatio)).toFixed(3))) {
                    heatInputRatios.push((1 / parseFloat(heatInputRatio)).toFixed(3));
                }
            }
            if (item['HW-LOOP']) {
                const hWLoopValue = item['HW-LOOP'];
                if (hWLoopValue !== '' && !hwLoopValues.includes(hWLoopValue)) {
                    hwLoopValues.push(hWLoopValue);
                }
            }
        });
    }
    
    const valuesToRemove = ['SUM', 'NONE', 'UNCONDITIONED', 'CONDITIONED'];
    const filteredHvacTypes = _.filter(hvacTypes, (value) => !valuesToRemove.includes(value));
    result.hvacTypes = result.hvacTypes.length > 0 ? result.hvacTypes.concat(filteredHvacTypes) : filteredHvacTypes;
    result.coolingEIR = result.coolingEIR.length > 0 ? result.coolingEIR.concat(coolEIR) : coolEIR;
    result.heatingEIR = result.heatingEIR.length > 0 ? result.heatingEIR.concat(heatEIR) : heatEIR;
    result.capacityRatios = result.capacityRatios.length > 0 ? result.capacityRatios.concat(capacityRatios) : capacityRatios;
    result.heatInputRatios = result.heatInputRatios.length > 0 ? result.heatInputRatios.concat(heatInputRatios) : heatInputRatios;
  } catch (err) {
      throw new Error(`Error extracting HVAC data ${err}`);
  }
}

/**
 * Extracts chiller data from the header and updates the result object.
 * @param header - The header object containing chiller data.
 * @param result - The result object to be updated with the extracted chiller data.
 * @throws {Error} If there is an error extracting the chiller data.
 */
function extractChillersData(header: any, result: I_ProjectFileResult) {
  try {
    const chillerEIR: number[] = [];
    if (header['Chillers']) {
        const chillers = header['Chillers'];
        _.forEach(chillers, (item: any) => {
            if (item['ELEC-INPUT-RATIO']) {
                const elecInputRatio = item['ELEC-INPUT-RATIO'];
                if (elecInputRatio && !chillerEIR.includes(elecInputRatio)) {
                    chillerEIR.push(elecInputRatio);
                }
            }
        });
        result.chillerEIR = chillerEIR.length > 0 ? chillerEIR : ['Default Value'];
    }
  } catch (err) {
      throw new Error(`Error extracting chillers data ${err}`);
  }
}

/**
 * Transforms a string by replacing occurrences of "{numerator/denominator}" with the result of the division.
 * If the string does not contain the specified pattern, it is returned as is.
 * @param input The input string to transform.
 * @returns The transformed string.
 */
function transformString(input: string): string {
    let regex = /\{\s*([^}]+)\s*\}/;
    let match = input.match(regex);
    let result = '';

    if (match && match.length === 2) {
        result = calculateAndFormat(match[1]);
        return input.split('=')[0].trim() + '=' + result;
    } else {
        regex = /\{\s*(\d+(\.\d+)?)\/(\d+(\.\d+)?)\s*(}\r|\r)/;
        match = input.match(regex);
        if (match && match.length >= 3) {
            const [ , numerator, , denominator ] = match;
            const result = parseFloat(numerator) / parseFloat(denominator);

            const transformed = input.replace(regex, `${result.toFixed(4)}\r`);

            return transformed.trim();
        } else {
            return input.trim();
        }
    }
}

function calculateAndFormat(input: string): string {
    const regex = /(\d+(\.\d+)?|\.?\d+)(\/(\d+(\.\d+)?|\.?\d+))?/;
    const match = input.match(regex);
    let result = input;

    if (match) {
        const numerator = parseFloat(match[1]);
        const denominator = parseFloat(match[4]);

        if (numerator && denominator) {
            result = (numerator / denominator).toFixed(3);
        } else {
            result = eval(input).toFixed(3);
        }        
    }
    return result;
}

/**
 * Finds an item in the given array of materials that has the specified properties.
 * 
 * @param materials - The array of materials to search.
 * @param properties - The properties to check for in each item.
 * @returns The first item that has at least one of the specified properties, or undefined if no such item is found.
 */
const findItemWithProperties = (materials: any[], properties: string[]) => {
    return _.find(materials, (item: any) => {
        return properties.some(property => item.hasOwnProperty(property));
    });
};

/**
 * Extracts vector points from a polygon vector.
 * @param polygonVector - The polygon vector to extract points from.
 * @returns An array of vector points.
 */
function extractVectors(polygonVector: any): VectorPoint[] {
    let vectors: VectorPoint[] = [];
    _.forEach(polygonVector, (vector: string) => {
        if (vector && vector.startsWith('( ') && vector.endsWith(' )')) {
            const [x, y] = vector.slice(1, -1).split(", ").map(Number);
            vectors.push({x , y});
        }
    });
    return vectors;
}

/**
 * Calculates the area of a polygon defined by its vertexes.
 * 
 * @param vertexes - An array of vertexes representing the polygon.
 * @returns The area of the polygon.
 */
function calculatePolygonArea(vertexes: VectorPoint[]) {
    let area: number = 0.0;
    const vertexesLength = vertexes.length;
    for (let i = 0; i < vertexesLength; i++) {
        const j = (i + 1) % vertexesLength;
        area += vertexes[i].x * vertexes[j].y;
        area -= vertexes[j].x * vertexes[i].y;
    }                    
    return Math.abs(area) / 2.0;
}

function getFloorPolygonName (polygon: string) {
    const jsonObject = polygon;

    const key = Object.keys(jsonObject).find(key => key.includes('Floor Polygon')) ?? '';
    const cleanKey = key.replace(/^"|"$/g, '');
    return cleanKey;
}

function extractMultiplePolygon(header: any, result: I_ProjectFileResult) {
    try {
        const miscObjects = header[0]['Misc Cost Related Objects'];
        const miscObject = miscObjects
            .filter((item: any) => Object.values(item).includes("FLOOR") && item.MULTIPLIER)
            .map((item: any) => ({
                POLYGON: item.POLYGON.replace(/^"|"$/g, ''),  // Remove quotes if present
                MULTIPLIER: Number.parseInt(item.MULTIPLIER)
            }));
        result.multipliers = miscObject;
    } catch (e) {
        throw new Error(`Error extracting Floor data ${e}`);
    }
}

function extractFurnance(header: any, result: I_ProjectFileResult) {
    try {
        let zoneFurnaceHIRValue = '0'
        const miscObjects = header[0]['Chilled Water Meters'];
        _.forEach(miscObjects, (item: any) => {
            if (item['ZONE-HEAT-SOURCE']) {
                const zoneHeatSource = item['ZONE-HEAT-SOURCE'];
                if (zoneHeatSource === 'FURNACE' && !result.hvacTypes.includes(zoneHeatSource)) {
                    result.hvacTypes.push(zoneHeatSource);
                }
            }
            if (item['FURNACE-HIR']) {
                const zoneFurnaceHIR = item['FURNACE-HIR'];
                if (!isNaN(zoneFurnaceHIR)) {
                    const doublevalue = parseFloat(zoneFurnaceHIR);
                    if (!isNaN(doublevalue)){
                        zoneFurnaceHIRValue = (1 / doublevalue).toFixed(3).toString();
                    }
                    if (!result.heatInputRatios.includes(zoneFurnaceHIRValue)) {
                        result.heatInputRatios.push(zoneFurnaceHIRValue);
                    }                 
                }
            }
        });
    } catch (e) { 
        throw new Error(`Error extracting Furnance data ${e}`);
    }
}

function extractHeatPump(header: any, result: I_ProjectFileResult) {
    try {
        let coolingEIRValue = '0';
        const miscObjects = header[0]['Chilled Water Meters'];
        _.forEach(miscObjects, (item: any) => {
            if (item['HEAT-SOURCE']) {
                const heatSource = item['HEAT-SOURCE'];
                if (heatSource === 'HEAT-PUMP' && !result.hvacTypes.includes(heatSource)) {
                    result.hvacTypes.push(heatSource);
                }
            }
            if (item['HEATING-EIR']) {
                const heatingEIR = item['HEATING-EIR'];
                if (!isNaN(heatingEIR) && !result.heatingEIR.includes(`${heatingEIR} AFUE`)) {
                    result.heatingEIR.push(`${heatingEIR} AFUE`);
                }
            }
            if (item['COOLING-EIR']) {
                const coolingEIR = item['COOLING-EIR'];
                if (!isNaN(coolingEIR)) {
                    const doublevalue = parseFloat(coolingEIR);
                    if (!isNaN(doublevalue)){
                        coolingEIRValue = (1 / doublevalue).toFixed(3).toString();
                    }
                    if (!result.heatingEIR.includes(`${coolingEIRValue} COP`)) {
                        result.heatingEIR.push(`${coolingEIRValue} COP`);
                    }                 
                }
            }
        });
    } catch (e) {
        throw new Error(`Error extracting Heat Pump data ${e}`);
    }
}

function extractOccupancyAssumptions(header: any, result: I_ProjectFileResult) {
    let infoObtained = false;

    try {
        if (header['Misc Cost Related Objects'] && Array.isArray(header['Misc Cost Related Objects'])) {
            const values = header['Misc Cost Related Objects'];

            let index = 0;
            while (!infoObtained && index < values.length) {
                const item = values[index];
                try {
                    if (item['PEOPLE-HG-LAT']) {
                        result.latentHeatPerPerson = item['PEOPLE-HG-LAT'] ?? '100';
                        result.sensibleHeatPerPerson = item['PEOPLE-HG-SENS'] ?? '250';
                        result.receptacleLoadWPerSf = item['EQUIPMENT-W/AREA'].replace(/[()]/g, '').trim();
                        result.areaPerPerson = item['AREA/PERSON'] ?? '100';
                        infoObtained = true;
                    }
                } catch (err) {
                    console.error(`Error processing item: ${err}`, item);
                }
                index++; // Incrementa el índice para la siguiente iteración
            }
        }
    } catch (e) {
        throw new Error(`Error extracting Occupancy Assumptions data: ${e}`);
    }
}

export { parseInpFile, getInpValues };