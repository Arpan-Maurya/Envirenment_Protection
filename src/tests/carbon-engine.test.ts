import { describe, it, expect } from 'vitest';
import { calculateFootprint, applyMonthlySavings, HABIT_MONTHLY_SAVINGS_KG } from '../lib/carbon-engine';
import { UserProfile } from '../types';

const baseProfile: UserProfile = {
  name: 'Test User',
  city: 'Mumbai',
  country: 'India',
  occupation: 'Engineer',
  transportMode: 'Car',
  fuelType: 'Petrol',
  commuteDistance: 10,
  electricityUsage: 200,
  acUsage: 4,
  foodPreference: 'Omnivore',
  shoppingHabits: 'Monthly',
  wasteHabits: 'Recycling',
  level: 1,
  xp: 0,
  ecoPoints: 0,
  streak: 0,
  completedOnboarding: false,
};

describe('calculateFootprint — Transport', () => {
  it('calculates petrol car emissions correctly', () => {
    const result = calculateFootprint({ ...baseProfile, transportMode: 'Car', fuelType: 'Petrol', commuteDistance: 10 });
    // 10km * 22 days * 0.17 kg/km = 37.4
    expect(result['Transport']).toBeCloseTo(37.4, 1);
  });

  it('calculates EV emissions lower than petrol', () => {
    const petrol = calculateFootprint({ ...baseProfile, transportMode: 'Car', fuelType: 'Petrol' });
    const ev = calculateFootprint({ ...baseProfile, transportMode: 'Car', fuelType: 'Electric' });
    expect(ev['Transport']).toBeLessThan(petrol['Transport']);
  });

  it('calculates diesel emissions higher than petrol', () => {
    const petrol = calculateFootprint({ ...baseProfile, fuelType: 'Petrol' });
    const diesel = calculateFootprint({ ...baseProfile, fuelType: 'Diesel' });
    expect(diesel['Transport']).toBeGreaterThan(petrol['Transport']);
  });

  it('calculates bus emissions correctly', () => {
    const result = calculateFootprint({ ...baseProfile, transportMode: 'Bus', commuteDistance: 10 });
    // 10 * 22 * 0.10 = 22
    expect(result['Transport']).toBeCloseTo(22, 1);
  });

  it('calculates metro emissions lower than bus', () => {
    const bus = calculateFootprint({ ...baseProfile, transportMode: 'Bus' });
    const metro = calculateFootprint({ ...baseProfile, transportMode: 'Metro' });
    expect(metro['Transport']).toBeLessThan(bus['Transport']);
  });

  it('returns zero transport emissions for cycling', () => {
    const result = calculateFootprint({ ...baseProfile, transportMode: 'Cycle' });
    expect(result['Transport']).toBe(0);
  });

  it('returns zero transport emissions for bike/walking', () => {
    const result = calculateFootprint({ ...baseProfile, transportMode: 'Bike' });
    expect(result['Transport']).toBe(0);
  });

  it('scales correctly with higher commute distance', () => {
    const short = calculateFootprint({ ...baseProfile, commuteDistance: 5 });
    const long = calculateFootprint({ ...baseProfile, commuteDistance: 50 });
    expect(long['Transport']).toBeCloseTo(short['Transport'] * 10, 0);
  });
});

describe('calculateFootprint — Home Energy', () => {
  it('calculates electricity emissions correctly', () => {
    // 200 kWh * 0.38 (default) + 4h * 30days * 1.2 = 76 + 144 = 220
    const result = calculateFootprint({ ...baseProfile, electricityUsage: 200, acUsage: 4 });
    expect(result['Home Energy']).toBeCloseTo(220, 0);
  });

  it('returns zero home energy for zero usage', () => {
    const result = calculateFootprint({ ...baseProfile, electricityUsage: 0, acUsage: 0 });
    expect(result['Home Energy']).toBe(0);
  });

  it('higher electricity usage gives higher emissions', () => {
    const low = calculateFootprint({ ...baseProfile, electricityUsage: 100, acUsage: 0 });
    const high = calculateFootprint({ ...baseProfile, electricityUsage: 500, acUsage: 0 });
    expect(high['Home Energy']).toBeGreaterThan(low['Home Energy']);
  });

  it('higher AC usage gives higher emissions', () => {
    const low = calculateFootprint({ ...baseProfile, acUsage: 1 });
    const high = calculateFootprint({ ...baseProfile, acUsage: 8 });
    expect(high['Home Energy']).toBeGreaterThan(low['Home Energy']);
  });
});

describe('calculateFootprint — Food', () => {
  it('vegan diet has lowest food emissions', () => {
    const vegan = calculateFootprint({ ...baseProfile, foodPreference: 'Vegan' });
    const vegetarian = calculateFootprint({ ...baseProfile, foodPreference: 'Vegetarian' });
    const omnivore = calculateFootprint({ ...baseProfile, foodPreference: 'Omnivore' });
    const carnivore = calculateFootprint({ ...baseProfile, foodPreference: 'Carnivore' });
    expect(vegan['Food']).toBeLessThan(vegetarian['Food']);
    expect(vegetarian['Food']).toBeLessThan(omnivore['Food']);
    expect(omnivore['Food']).toBeLessThan(carnivore['Food']);
  });

  it('calculates vegan food emissions correctly', () => {
    const result = calculateFootprint({ ...baseProfile, foodPreference: 'Vegan' });
    // 30 days * 2.9 = 87
    expect(result['Food']).toBeCloseTo(87, 0);
  });

  it('calculates omnivore food emissions correctly', () => {
    const result = calculateFootprint({ ...baseProfile, foodPreference: 'Omnivore' });
    // 30 * 7.0 = 210
    expect(result['Food']).toBeCloseTo(210, 0);
  });
});

describe('calculateFootprint — Shopping', () => {
  it('weekly shopping has highest emissions', () => {
    const rare = calculateFootprint({ ...baseProfile, shoppingHabits: 'Rarely' });
    const monthly = calculateFootprint({ ...baseProfile, shoppingHabits: 'Monthly' });
    const weekly = calculateFootprint({ ...baseProfile, shoppingHabits: 'Weekly' });
    expect(weekly['Shopping']).toBeGreaterThan(monthly['Shopping']);
    expect(monthly['Shopping']).toBeGreaterThan(rare['Shopping']);
  });

  it('rarely shopping returns low value', () => {
    const result = calculateFootprint({ ...baseProfile, shoppingHabits: 'Rarely' });
    expect(result['Shopping']).toBe(50);
  });
});

describe('calculateFootprint — Waste', () => {
  it('both recycling and composting gives lowest waste emissions', () => {
    const none = calculateFootprint({ ...baseProfile, wasteHabits: 'None' });
    const both = calculateFootprint({ ...baseProfile, wasteHabits: 'Both' });
    expect(both['Waste']).toBeLessThan(none['Waste']);
  });

  it('returns correct value for no waste management', () => {
    const result = calculateFootprint({ ...baseProfile, wasteHabits: 'None' });
    expect(result['Waste']).toBe(20);
  });

  it('returns correct value for both habits', () => {
    const result = calculateFootprint({ ...baseProfile, wasteHabits: 'Both' });
    expect(result['Waste']).toBe(2);
  });
});

describe('calculateFootprint — Return Shape', () => {
  it('returns all 5 categories', () => {
    const result = calculateFootprint(baseProfile);
    expect(result).toHaveProperty('Transport');
    expect(result).toHaveProperty('Home Energy');
    expect(result).toHaveProperty('Food');
    expect(result).toHaveProperty('Shopping');
    expect(result).toHaveProperty('Waste');
  });

  it('all values are non-negative numbers', () => {
    const result = calculateFootprint(baseProfile);
    Object.values(result).forEach(val => {
      expect(typeof val).toBe('number');
      expect(val).toBeGreaterThanOrEqual(0);
    });
  });

  it('total footprint is sum of all categories', () => {
    const result = calculateFootprint(baseProfile);
    const total = Object.values(result).reduce((a, b) => a + b, 0);
    expect(total).toBeGreaterThan(0);
  });
});

describe('applyMonthlySavings', () => {
  it('reduces the base footprint by completed habits and actions', () => {
    const total = applyMonthlySavings(300, 3, 40);
    expect(total).toBe(300 - 3 * HABIT_MONTHLY_SAVINGS_KG - 40);
  });

  it('never returns negative values', () => {
    const total = applyMonthlySavings(10, 5, 200);
    expect(total).toBe(0);
  });

  it('ignores negative habit/action counts', () => {
    const total = applyMonthlySavings(200, -2, -50);
    expect(total).toBe(200);
  });

  it('keeps footprint when no habits or actions are saved', () => {
    const total = applyMonthlySavings(250, 0, 0);
    expect(total).toBe(250);
  });
});