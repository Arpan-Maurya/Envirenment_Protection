import { describe, it, expect } from 'vitest';
import { calculateAnnualFootprint } from '../lib/simulator-engine';
import { generateWeeklyMissions } from '../lib/mission-engine';
import { EMISSION_FACTORS } from '../lib/emission-factors';

// ─── calculateAnnualFootprint ───────────────────────────────────────────────

const baseLifestyleData = {
  transport: {
    carKmPerWeek: 100,
    carType: 'car_petrol' as const,
    publicTransportKmPerWeek: 0,
    flightsPerHourPerYear: 0,
  },
  energy: {
    electricityKwhPerMonth: 200,
    acHoursPerDay: 4,
  },
  diet: {
    type: 'omnivore_daily' as const,
  },
};

describe('calculateAnnualFootprint — Return Shape', () => {
  it('returns total, breakdown and monthlyAverage', () => {
    const result = calculateAnnualFootprint(baseLifestyleData);
    expect(result).toHaveProperty('total');
    expect(result).toHaveProperty('breakdown');
    expect(result).toHaveProperty('monthlyAverage');
  });

  it('monthlyAverage is total divided by 12', () => {
    const result = calculateAnnualFootprint(baseLifestyleData);
    expect(result.monthlyAverage).toBe(Math.round(result.total / 12));
  });

  it('breakdown contains Transport, Energy, Food', () => {
    const result = calculateAnnualFootprint(baseLifestyleData);
    expect(result.breakdown).toHaveProperty('Transport');
    expect(result.breakdown).toHaveProperty('Energy');
    expect(result.breakdown).toHaveProperty('Food');
  });

  it('all values are non-negative integers', () => {
    const result = calculateAnnualFootprint(baseLifestyleData);
    expect(result.total).toBeGreaterThanOrEqual(0);
    expect(Number.isInteger(result.total)).toBe(true);
    expect(Number.isInteger(result.monthlyAverage)).toBe(true);
  });
});

describe('calculateAnnualFootprint — Transport', () => {
  it('zero car usage gives zero car transport contribution', () => {
    const data = {
      ...baseLifestyleData,
      transport: { ...baseLifestyleData.transport, carKmPerWeek: 0, publicTransportKmPerWeek: 0 },
    };
    const result = calculateAnnualFootprint(data);
    expect(result.breakdown.Transport).toBe(0);
  });

  it('higher car km increases transport emissions', () => {
    const low = calculateAnnualFootprint({ ...baseLifestyleData, transport: { ...baseLifestyleData.transport, carKmPerWeek: 50 } });
    const high = calculateAnnualFootprint({ ...baseLifestyleData, transport: { ...baseLifestyleData.transport, carKmPerWeek: 500 } });
    expect(high.breakdown.Transport).toBeGreaterThan(low.breakdown.Transport);
  });

  it('flights add to transport emissions', () => {
    const noFlights = calculateAnnualFootprint({ ...baseLifestyleData, transport: { ...baseLifestyleData.transport, flightsPerHourPerYear: 0 } });
    const withFlights = calculateAnnualFootprint({ ...baseLifestyleData, transport: { ...baseLifestyleData.transport, flightsPerHourPerYear: 10 } });
    expect(withFlights.breakdown.Transport).toBeGreaterThan(noFlights.breakdown.Transport);
  });
});

describe('calculateAnnualFootprint — Energy', () => {
  it('zero energy usage gives zero energy emissions', () => {
    const data = { ...baseLifestyleData, energy: { electricityKwhPerMonth: 0, acHoursPerDay: 0 } };
    const result = calculateAnnualFootprint(data);
    expect(result.breakdown.Energy).toBe(0);
  });

  it('higher electricity usage increases energy emissions', () => {
    const low = calculateAnnualFootprint({ ...baseLifestyleData, energy: { electricityKwhPerMonth: 100, acHoursPerDay: 0 } });
    const high = calculateAnnualFootprint({ ...baseLifestyleData, energy: { electricityKwhPerMonth: 1000, acHoursPerDay: 0 } });
    expect(high.breakdown.Energy).toBeGreaterThan(low.breakdown.Energy);
  });
});

describe('calculateAnnualFootprint — Food', () => {
  it('vegan diet has lower annual food emissions than omnivore', () => {
    const omnivore = calculateAnnualFootprint({ ...baseLifestyleData, diet: { type: 'omnivore_daily' } });
    const vegan = calculateAnnualFootprint({ ...baseLifestyleData, diet: { type: 'vegan_daily' } });
    expect(vegan.breakdown.Food).toBeLessThan(omnivore.breakdown.Food);
  });

  it('food emissions match expected annual calculation', () => {
    const result = calculateAnnualFootprint({ ...baseLifestyleData, diet: { type: 'omnivore_daily' } });
    const expected = Math.round(365 * EMISSION_FACTORS.food.omnivore_daily);
    expect(result.breakdown.Food).toBe(expected);
  });
});

// ─── generateWeeklyMissions ──────────────────────────────────────────────────

describe('generateWeeklyMissions — Output', () => {
  const profile = {
    name: 'Test', city: 'Mumbai', country: 'India', occupation: 'Dev',
    transportMode: 'Car', fuelType: 'Petrol', commuteDistance: 10,
    electricityUsage: 200, acUsage: 4,
    foodPreference: 'Omnivore', shoppingHabits: 'Monthly', wasteHabits: 'None',
    level: 1, xp: 0, ecoPoints: 0, streak: 0,
  };

  it('returns an array of missions', () => {
    const missions = generateWeeklyMissions(profile as any);
    expect(Array.isArray(missions)).toBe(true);
    expect(missions.length).toBeGreaterThan(0);
  });

  it('every mission has required fields', () => {
    const missions = generateWeeklyMissions(profile as any);
    missions.forEach(m => {
      expect(m).toHaveProperty('id');
      expect(m).toHaveProperty('title');
      expect(m).toHaveProperty('target');
      expect(m).toHaveProperty('xpReward');
      expect(m).toHaveProperty('ecoPointsReward');
      expect(m).toHaveProperty('category');
    });
  });

  it('all xpReward values are positive', () => {
    const missions = generateWeeklyMissions(profile as any);
    missions.forEach(m => expect(m.xpReward).toBeGreaterThan(0));
  });

  it('all ecoPointsReward values are positive', () => {
    const missions = generateWeeklyMissions(profile as any);
    missions.forEach(m => expect(m.ecoPointsReward).toBeGreaterThan(0));
  });

  it('target is always >= current', () => {
    const missions = generateWeeklyMissions(profile as any);
    missions.forEach(m => expect(m.target).toBeGreaterThanOrEqual(m.current));
  });

  it('no duplicate mission IDs', () => {
    const missions = generateWeeklyMissions(profile as any);
    const ids = missions.map(m => m.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});