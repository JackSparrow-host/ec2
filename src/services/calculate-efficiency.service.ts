
import { coolingEIR } from '../constants/jsFiles/cooling';

/**
 * Calculates the cooling efficiency based on the given area, HVAC ID, and cooling rate.
 * @param area The area to be cooled.
 * @param hvacId The ID of the HVAC system.
 * @param coolingRate The cooling rate in square feet per ton.
 * @returns An object containing the calculated cooling efficiency information.
 * @throws Error if there is an error in the calculation.
 */
function getCoolEff(area: number, hvacId: number, coolingRate: number)
                   :{techType: string, desc: string, noOfChillers: number, capacity: string, EIR: string} {
    try {
      let techType: string = '';
      let noOfChillers: number = 0;
      let desc: string = '';
      let capacity: string = '';
      let EIR: string = '';
  
      const coolingTons = Math.ceil(area / coolingRate);
      const coolingBTUh = coolingTons * 12000;
  
      switch (hvacId) {
          case 1:
          case 2:{
              techType = 'DX';
              desc = 'New construction';
              capacity = `${Math.floor(coolingBTUh / 1000)} kBTUh`;
              EIR = (3.2769 / (12.5 - (0.213 * coolingBTUh) / 1000) - 0.03987).toFixed(2);
              break;
          }
          case 3:{
              techType = 'DX';
              desc = 'Air Conditioners';
              capacity = `${Math.floor(coolingBTUh / 1000)} kBTUh`;
              if (coolingBTUh < 65000) {
                EIR = coolingEIR.HVAC_ID_3.LESS_THAN_650000.toString();
              } else if (coolingBTUh >= 65000 && coolingBTUh < 135000) {
                EIR = coolingEIR.HVAC_ID_3.GREATER_THAN_EQUAL_TO_65000_LESS_THAN_135000.toString();
              } else if (coolingBTUh >= 135000 && coolingBTUh < 240000) {
                EIR = coolingEIR.HVAC_ID_3.GREATER_THAN_EQUAL_TO_135000_LESS_THAN_240000.toString();
              } else if (coolingBTUh >= 240000 && coolingBTUh < 760000) {
                EIR = coolingEIR.HVAC_ID_3.GREATER_THAN_EQUAL_TO_240000_LESS_THAN_760000.toString();
              } else if (coolingBTUh >= 760000) {
                EIR = coolingEIR.HVAC_ID_3.GREATER_THAN_EQUAL_TO_760000.toString();
              }
              break;
          }
          case 4: {
              techType = 'DX';
              desc = 'Air Conditioners';
              capacity = `${Math.floor(coolingBTUh / 1000)} kBTUh`;
              if (coolingBTUh < 65000) {
                EIR = coolingEIR.HVAC_ID_4.LESS_THAN_650000.toString();
              } else if (coolingBTUh >= 65000 && coolingBTUh < 135000) {
                EIR = coolingEIR.HVAC_ID_4.GREATER_THAN_EQUAL_TO_65000_LESS_THAN_135000.toString();
              } else if (coolingBTUh >= 135000 && coolingBTUh < 240000) {
                EIR = coolingEIR.HVAC_ID_4.GREATER_THAN_EQUAL_TO_135000_LESS_THAN_240000.toString();
              } else if (coolingBTUh >= 240000) {
                EIR = coolingEIR.HVAC_ID_4.GREATER_THAN_EQUAL_TO_240000.toString();
              }
              break;
          }
          case 5: {
              techType = 'DX';
              desc = 'Air Conditioners';
              capacity = `${Math.floor(coolingBTUh / 1000)} kBTUh`;
              if (coolingBTUh < 65000) {
                EIR = coolingEIR.HVAC_ID_5.LESS_THAN_650000.toString();
              } else if (coolingBTUh >= 65000 && coolingBTUh < 135000) {
                EIR = coolingEIR.HVAC_ID_5.GREATER_THAN_EQUAL_TO_65000_LESS_THAN_135000.toString();
              } else if (coolingBTUh >= 135000 && coolingBTUh < 240000) {
                EIR = coolingEIR.HVAC_ID_5.GREATER_THAN_EQUAL_TO_135000_LESS_THAN_240000.toString();
              } else if (coolingBTUh >= 240000 && coolingBTUh < 760000) {
                EIR = coolingEIR.HVAC_ID_5.GREATER_THAN_EQUAL_TO_240000_LESS_THAN_760000.toString();
              } else if (coolingBTUh >= 760000) {
                EIR = coolingEIR.HVAC_ID_5.GREATER_THAN_EQUAL_TO_760000.toString();
              }
              break;
          }
          case 6: {
              techType = 'DX';
              desc = 'Air Conditioners';
              capacity = `${Math.floor(coolingBTUh / 1000)} kBTUh`;
              if (coolingBTUh < 65000) {
                EIR = coolingEIR.HVAC_ID_6.LESS_THAN_650000.toString();
              } else if (coolingBTUh >= 65000 && coolingBTUh < 135000) {
                EIR = coolingEIR.HVAC_ID_6.GREATER_THAN_EQUAL_TO_65000_LESS_THAN_135000.toString();
              } else if (coolingBTUh >= 135000 && coolingBTUh < 240000) {
                EIR = coolingEIR.HVAC_ID_6.GREATER_THAN_EQUAL_TO_135000_LESS_THAN_240000.toString();
              } else if (coolingBTUh >= 240000 && coolingBTUh < 760000) {
                EIR = coolingEIR.HVAC_ID_6.GREATER_THAN_EQUAL_TO_240000_LESS_THAN_760000.toString();
              } else if (coolingBTUh >= 760000) {
                EIR = coolingEIR.HVAC_ID_6.GREATER_THAN_EQUAL_TO_760000.toString();
              }
              break;
          }
          case 7: {
              capacity = `${coolingTons} Tons`;
              techType = 'Chiller';
              if (coolingTons < 300) {
                  desc = 'Water cooled screw/scroll';
                  noOfChillers = 1;
                  if (coolingTons < 150) {
                      EIR = coolingEIR.HVAC_ID_7.LESS_THAN_300.LESS_THAN_150.toString();
                  } else if (coolingTons >= 150 && coolingTons < 300) {
                      EIR = coolingEIR.HVAC_ID_7.LESS_THAN_300.GREATER_THAN_EQUAL_TO_150_LESS_THAN_300.toString();
                  } else if (coolingTons >= 300) {
                      EIR = coolingEIR.HVAC_ID_7.LESS_THAN_300.GREATER_THAN_EQUAL_TO_300.toString();
                  }
              } else if (coolingTons >= 300 && coolingTons < 600) {
                  const value = coolingEIR.HVAC_ID_8.GREATER_THAN_EQUAL_TO_300_LESS_THAN_600;
                  desc = 'Water cooled screw/scroll';
                  noOfChillers = 2;
                  let chillerTons = Math.ceil(coolingTons / noOfChillers);
                  capacity = `${chillerTons} Tons`;
                  if (chillerTons < 150) {
                      EIR = value.LESS_THAN_150.toString();
                  } else if (chillerTons >= 150 && chillerTons < 300) {
                      EIR = value.GREATER_THAN_EQUAL_TO_150_LESS_THAN_300.toString();
                  } else if (chillerTons >= 300) {
                      EIR = value.GREATER_THAN_EQUAL_TO_300.toString();
                  }
              } else if (coolingTons >= 600) {
                  const value = coolingEIR.HVAC_ID_8.GREATER_THAN_EQUAL_TO_600;
                  desc = 'Centrifugal';
                  const maxChillerTons = 800;
                  const minChillers = 2;
                  let chillerTons = Math.ceil(coolingTons / minChillers);
                  noOfChillers = minChillers;
                  if (chillerTons > maxChillerTons) {
                      noOfChillers = Math.ceil(coolingTons / maxChillerTons);
                      chillerTons = Math.ceil(coolingTons / noOfChillers);
                  }
                  capacity = `${chillerTons} Tons`;
                  if (chillerTons < 150) {
                      EIR = value.LESS_THAN_150.toString();
                  } else if (chillerTons >= 150 && chillerTons < 300) {
                      EIR = value.GREATER_THAN_EQUAL_TO_150_LESS_THAN_300.toString();
                  } else if (chillerTons >= 300) {
                      EIR = value.GREATER_THAN_EQUAL_TO_300.toString();
                  }
              }
              break;     
          }   
          case 8: {
              capacity = `${coolingTons} Tons`;
              techType = 'Chiller';
        
              if (coolingTons < 300) {
                  const value = coolingEIR.HVAC_ID_8.LESS_THAN_300;
                  desc = 'Water cooled screw/scroll';
                  noOfChillers = 1;
                  if (coolingTons < 150) {
                  EIR = value.LESS_THAN_150.toString();
                  } else if (coolingTons >= 150 && coolingTons <= 300) {
                  EIR = value.GREATER_THAN_EQUAL_TO_150_LESS_THAN_EQUAL_TO_300.toString();
                  }
              } else if (coolingTons >= 300 && coolingTons < 600) {
                  const value = coolingEIR.HVAC_ID_8.GREATER_THAN_EQUAL_TO_300_LESS_THAN_600;
                  desc = 'Water cooled screw/scroll';
                  noOfChillers = 2;
                  let chillerTons = Math.ceil(coolingTons / noOfChillers);
                  capacity = `${chillerTons} Tons`;
                  if (chillerTons < 150) {
                      EIR = value.LESS_THAN_150.toString();
                  } else if (chillerTons >= 150 && chillerTons < 300) {
                      EIR = value.GREATER_THAN_EQUAL_TO_150_LESS_THAN_300.toString();
                  } else if (chillerTons >= 300) {
                      EIR = value.GREATER_THAN_EQUAL_TO_300.toString();
                  }
              } else if (coolingTons >= 600) {
                  const value = coolingEIR.HVAC_ID_8.GREATER_THAN_EQUAL_TO_600;
                  desc = 'Centrifugal';
                  const maxChillerTons = 800;
                  const minChillers = 2;
                  let chillerTons = Math.ceil(coolingTons / minChillers);
                  noOfChillers = minChillers;
                  if (chillerTons > maxChillerTons) {
                  noOfChillers = Math.ceil(coolingTons / maxChillerTons);
                  chillerTons = Math.ceil(coolingTons / noOfChillers);
                  }
                  capacity = `${chillerTons} Tons`;
                  if (chillerTons < 150) {
                      EIR = value.LESS_THAN_150.toString();
                  } else if (chillerTons >= 150 && chillerTons < 300) {
                      EIR = value.GREATER_THAN_EQUAL_TO_150_LESS_THAN_300.toString();
                  } else if (chillerTons >= 300) {
                      EIR = value.GREATER_THAN_EQUAL_TO_300.toString();
                  }
              }
              break;
          }
      }
  
      return { techType, desc, noOfChillers, capacity, EIR };
    } catch (error: any) {
        throw new Error(`Error in getCoolEff: ${error.message}`);      
    }
}

/**
 * Calculates the heat efficiency based on the given parameters.
 * @param area - The area in square units.
 * @param hvacId - The ID of the HVAC system.
 * @param heatingRate - The heating rate.
 * @returns An object containing the calculated heat efficiency details.
 * @throws Error if there is an error in the calculation.
 */
function getHeatEff(area: number, hvacId: number, heatingRate: number)
                    :{ techType: string; desc: string; capacity: string; effType: string; effRate: string; } {
    try {
      let techType: string = '';
      let desc: string = '';
      let type: string = '';
      let effRate: string = '';
    
      const heatingBtuh = area * heatingRate;
    
      switch (hvacId) {
        case 1:
          techType = 'HW Boiler';
          desc = 'Gas Fired';
          type = 'AFUE';
          effRate = '0.8';
          break;
        case 2:
          techType = 'Elec HP';
          desc = 'PTHP';
          type = 'EIR';
          effRate = (1 / (3.2 - (0.026 * heatingBtuh) / 1000)).toFixed(2);
          break;
        case 3:
          techType = 'Furnace';
          desc = 'Gas Fired';
          type = 'AFUE';
          effRate = heatingBtuh < 225000 ? '0.78' : '0.8';
          break;
        case 4:
          techType = 'Elec HP';
          desc = 'Air cooled (heating mode)';
          type = 'EIR';
          if (heatingBtuh < 65000) {
            effRate = '0.44';
          } else if (heatingBtuh >= 65000 && heatingBtuh < 135000) {
            effRate = '0.31';
          } else if (heatingBtuh >= 135000) {
            effRate = '0.32';
          }
          break;
        case 5:
        case 7:
          techType = 'HW Boiler';
          desc = 'Gas Fired';
          type = 'AFUE';
          effRate = '0.8';
          break;
        case 6:
        case 8:
          techType = 'Elec Res';
          break;
      }
    
      return { techType, desc, capacity: `${Math.floor(heatingBtuh / 1000)} kBTUh`, effType: type, effRate};
    } catch (error: any) {
        throw new Error(`Error in getHeatEff: ${error.message}`);
    }
}

export { getCoolEff, getHeatEff }
  