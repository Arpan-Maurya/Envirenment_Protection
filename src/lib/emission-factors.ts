/**
 * Emission factors based on average values (kg CO2e per unit)
 */
export const EMISSION_FACTORS = {
  transport: {
    car_petrol: 0.17,
    car_diesel: 0.19,
    car_ev: 0.05,
    bus: 0.1,
    metro: 0.03,
    cycling: 0,
    walking: 0
  },
  energy: {
    electricity_kwh: 0.45,
    ac_hourly: 1.2,
    heating_gas: 0.2
  },
  food: {
    omnivore_daily: 7.0,
    vegetarian_daily: 3.8,
    vegan_daily: 2.9,
    pescatarian_daily: 3.9
  },
  shopping: {
    high: 500,
    average: 200,
    low: 50
  },
  waste: {
    landfill_kg: 0.5,
    recycled_kg: 0.1,
    compost_kg: 0.05
  }
};

export const GRID_FACTORS: Record<string, number> = {
  US: 0.38,
  UK: 0.21,
  DE: 0.35,
  FR: 0.05,
  IN: 0.71,
  default: 0.38
};
