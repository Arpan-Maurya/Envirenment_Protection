import { describe, it, expect } from 'vitest';
import { EMISSION_FACTORS } from '../lib/emission-factors';
import { calculateFootprint } from '../lib/carbon-engine';
import { UserProfile } from '../types';

const baseProfile: UserProfile = {
  name: 'Test', city: 'Mumbai', country: 'India', occupation: 'Dev',
  transportMode: 'Car', fuelType: 'Petrol', commuteDistance: 10,
  electricityUsage: 200, acUsage: 4,
  foodPreference: 'Omnivore', shoppingHabits: 'Monthly', wasteHabits: 'Recycling',
  level: 1, xp: 0, ecoPoints: 0, streak: 0, completedOnboarding: false,
};

// ─── EMISSION_FACTORS Integrity ───────────────────────────────────────────────

describe('EMISSION_FACTORS — Data Integrity', () => {
  it('all transport factors are non-negative', () => {
    Object.entries(EMISSION_FACTORS.transport).forEach(([, val]) => {
      expect(val).toBeGreaterThanOrEqual(0);
    });
  });

  it('all energy factors are positive', () => {
    expect(EMISSION_FACTORS.energy.electricity_kwh).toBeGreaterThan(0);
    expect(EMISSION_FACTORS.energy.ac_hourly).toBeGreaterThan(0);
  });

  it('all food factors are positive', () => {
    Object.values(EMISSION_FACTORS.food).forEach(val => {
      expect(val).toBeGreaterThan(0);
    });
  });

  it('car petrol factor is between 0.1 and 0.3 kg CO2e/km (realistic range)', () => {
    expect(EMISSION_FACTORS.transport.car_petrol).toBeGreaterThanOrEqual(0.1);
    expect(EMISSION_FACTORS.transport.car_petrol).toBeLessThanOrEqual(0.3);
  });

  it('EV factor is lower than petrol factor', () => {
    expect(EMISSION_FACTORS.transport.car_ev).toBeLessThan(EMISSION_FACTORS.transport.car_petrol);
  });

  it('cycling and walking factors are zero', () => {
    expect(EMISSION_FACTORS.transport.cycling).toBe(0);
    expect(EMISSION_FACTORS.transport.walking).toBe(0);
  });

  it('vegan daily emissions are less than vegetarian', () => {
    expect(EMISSION_FACTORS.food.vegan_daily).toBeLessThan(EMISSION_FACTORS.food.vegetarian_daily);
  });

  it('vegetarian daily emissions are less than omnivore', () => {
    expect(EMISSION_FACTORS.food.vegetarian_daily).toBeLessThan(EMISSION_FACTORS.food.omnivore_daily);
  });

  it('shopping high > average > low', () => {
    expect(EMISSION_FACTORS.shopping.high).toBeGreaterThan(EMISSION_FACTORS.shopping.average);
    expect(EMISSION_FACTORS.shopping.average).toBeGreaterThan(EMISSION_FACTORS.shopping.low);
  });
});

// ─── Edge Cases & Boundary Conditions ─────────────────────────────────────────

describe('calculateFootprint — Boundary & Edge Cases', () => {
  it('handles zero commute distance gracefully', () => {
    const result = calculateFootprint({ ...baseProfile, commuteDistance: 0 });
    expect(result['Transport']).toBe(0);
    expect(() => calculateFootprint({ ...baseProfile, commuteDistance: 0 })).not.toThrow();
  });

  it('handles zero electricity usage gracefully', () => {
    const result = calculateFootprint({ ...baseProfile, electricityUsage: 0, acUsage: 0 });
    expect(result['Home Energy']).toBe(0);
  });

  it('handles very large commute distance without NaN', () => {
    const result = calculateFootprint({ ...baseProfile, commuteDistance: 999 });
    expect(isNaN(result['Transport'])).toBe(false);
    expect(isFinite(result['Transport'])).toBe(true);
  });

  it('handles very high electricity usage without NaN', () => {
    const result = calculateFootprint({ ...baseProfile, electricityUsage: 10000 });
    expect(isNaN(result['Home Energy'])).toBe(false);
  });

  it('handles undefined acUsage without crashing', () => {
    const profileWithoutAC = { ...baseProfile, acUsage: undefined as any };
    expect(() => calculateFootprint(profileWithoutAC)).not.toThrow();
  });

  it('handles undefined electricityUsage without crashing', () => {
    const profileWithoutElec = { ...baseProfile, electricityUsage: undefined as any };
    expect(() => calculateFootprint(profileWithoutElec)).not.toThrow();
  });

  it('hybrid car emissions are between petrol and EV', () => {
    const petrol = calculateFootprint({ ...baseProfile, fuelType: 'Petrol' });
    const hybrid = calculateFootprint({ ...baseProfile, fuelType: 'Hybrid' });
    const ev = calculateFootprint({ ...baseProfile, fuelType: 'Electric' });
    expect(hybrid['Transport']).toBeLessThan(petrol['Transport']);
    expect(hybrid['Transport']).toBeGreaterThan(ev['Transport']);
  });
});

// ─── Carbon Equivalency Logic ─────────────────────────────────────────────────

describe('Carbon Math — Logical Consistency', () => {
  it('switching from car to metro reduces transport significantly', () => {
    const carUser = calculateFootprint({ ...baseProfile, transportMode: 'Car', fuelType: 'Petrol' });
    const metroUser = calculateFootprint({ ...baseProfile, transportMode: 'Metro' });
    const reduction = carUser['Transport'] - metroUser['Transport'];
    expect(reduction).toBeGreaterThan(0);
    // Metro should save at least 70% vs petrol car
    expect(reduction / carUser['Transport']).toBeGreaterThan(0.7);
  });

  it('going vegan from carnivore saves at least 50% food emissions', () => {
    const carnivore = calculateFootprint({ ...baseProfile, foodPreference: 'Carnivore' });
    const vegan = calculateFootprint({ ...baseProfile, foodPreference: 'Vegan' });
    const reduction = carnivore['Food'] - vegan['Food'];
    expect(reduction / carnivore['Food']).toBeGreaterThan(0.5);
  });

  it('optimizing all factors gives meaningfully lower total footprint', () => {
    const highImpact = calculateFootprint({
      ...baseProfile,
      transportMode: 'Car', fuelType: 'Petrol', commuteDistance: 30,
      electricityUsage: 500, acUsage: 8,
      foodPreference: 'Carnivore',
      shoppingHabits: 'Weekly',
      wasteHabits: 'None',
    });
    const lowImpact = calculateFootprint({
      ...baseProfile,
      transportMode: 'Metro', fuelType: 'Electric', commuteDistance: 5,
      electricityUsage: 100, acUsage: 1,
      foodPreference: 'Vegan',
      shoppingHabits: 'Rarely',
      wasteHabits: 'Both',
    });
    const highTotal = Object.values(highImpact).reduce((a, b) => a + b, 0);
    const lowTotal = Object.values(lowImpact).reduce((a, b) => a + b, 0);
    expect(lowTotal).toBeLessThan(highTotal * 0.5); // low impact should be less than 50% of high
  });
});