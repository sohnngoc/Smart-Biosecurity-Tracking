// src/utils/carbonCalcUtils.ts

export interface EmissionCalculationParams {
  activityData: number; // e.g. quantity, headcount
  emissionFactor: number;
  gwp: number; // Global Warming Potential (e.g. 27 for CH4, 1 for CO2)
}

/**
 * Calculates emissions in tCO2e.
 * Formula: Emissions = Activity Data × Emission Factor × GWP / 1000
 */
export const calculateEmission = ({
  activityData,
  emissionFactor,
  gwp,
}: EmissionCalculationParams): number => {
  if (!activityData || !emissionFactor || !gwp) return 0;
  const result = (activityData * emissionFactor * gwp) / 1000;
  return Number(result.toFixed(2));
};

export interface AvoidedEmissionScenarioParams {
  sowsLostWithoutBioTrace: number;
  sowsLostWithBioTrace: number;
  rearingMonths: number;
  efEntericManure: number; // e.g., 14.5 kg CH4/head/year
  gwpCh4: number; // e.g., 27
}

export interface AvoidedEmissionResult {
  avoidedSowReplacement: number;
  avoidedTco2e: number;
}

/**
 * Simulates avoided emissions from successful biosecurity (outbreak mitigation).
 * Avoided Scope 1 FLAG Emissions = 
 *   avoided_sow_replacement × ef_ch4_enteric_manure × (rearing_months / 12) × gwp_ch4 ÷ 1000
 */
export const calculateAvoidedEmissions = ({
  sowsLostWithoutBioTrace,
  sowsLostWithBioTrace,
  rearingMonths,
  efEntericManure,
  gwpCh4
}: AvoidedEmissionScenarioParams): AvoidedEmissionResult => {
  const avoidedSowReplacement = Math.max(0, sowsLostWithoutBioTrace - sowsLostWithBioTrace);
  
  if (avoidedSowReplacement === 0) {
    return { avoidedSowReplacement: 0, avoidedTco2e: 0 };
  }

  const result = (avoidedSowReplacement * efEntericManure * (rearingMonths / 12) * gwpCh4) / 1000;
  
  return {
    avoidedSowReplacement,
    avoidedTco2e: Number(result.toFixed(2))
  };
};

/**
 * Categorizes activity to Scope and FLAG based on predefined rules.
 */
export const categorizeEmissionSource = (sourceName: string) => {
  const name = sourceName.toLowerCase();
  
  if (name.includes('enteric') || name.includes('manure')) {
    return { scope: 'Scope 1', flagStatus: 'FLAG' };
  }
  if (name.includes('fuel') || name.includes('generator') || name.includes('diesel')) {
    return { scope: 'Scope 1', flagStatus: 'Non-FLAG' };
  }
  if (name.includes('feed') || name.includes('land-use')) {
    return { scope: 'Scope 3', flagStatus: 'FLAG' };
  }
  if (name.includes('logistic') || name.includes('hardware') || name.includes('waste')) {
    return { scope: 'Scope 3', flagStatus: 'Non-FLAG' };
  }
  
  return { scope: 'Unknown', flagStatus: 'Unknown' };
};
