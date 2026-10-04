import { describe, it, expect } from 'vitest';
import { safeDivide, carbonEquivalency, cn, ecoLevelFromLifetimeXp, XP_PER_LEVEL } from '../lib/utils';

describe('utils', () => {
  describe('cn', () => {
    it('merges tailwind classes', () => {
      expect(cn('a', 'b')).toBe('a b');
      expect(cn('p-4', 'p-2')).toBe('p-2');
    });
  });

  describe('safeDivide', () => {
    it('divides numbers safely', () => {
      expect(safeDivide(10, 2)).toBe(5);
    });
    it('handles division by zero', () => {
      expect(safeDivide(10, 0)).toBe(0);
      expect(safeDivide(10, 0, 1)).toBe(1);
    });
  });

  describe('carbonEquivalency', () => {
    it('handles zero or negative', () => {
      expect(carbonEquivalency(0)).toBe('');
      expect(carbonEquivalency(-10)).toBe('');
    });
    it('returns trees for large numbers', () => {
      expect(carbonEquivalency(100)).toMatch(/trees/);
    });
    it('returns km for medium numbers', () => {
      expect(carbonEquivalency(50)).toMatch(/km not driven/);
    });
    it('returns phone charges for small numbers', () => {
      expect(carbonEquivalency(10)).toMatch(/phone charges/);
    });
  });

  describe('ecoLevelFromLifetimeXp', () => {
    it('starts at level 1', () => {
      expect(ecoLevelFromLifetimeXp(0)).toBe(1);
      expect(ecoLevelFromLifetimeXp(250)).toBe(1);
    });
    it('advances every XP_PER_LEVEL', () => {
      expect(ecoLevelFromLifetimeXp(XP_PER_LEVEL)).toBe(2);
      expect(ecoLevelFromLifetimeXp(XP_PER_LEVEL * 3 + 40)).toBe(4);
    });
    it('never returns values below 1', () => {
      expect(ecoLevelFromLifetimeXp(-50)).toBe(1);
      expect(ecoLevelFromLifetimeXp(NaN)).toBe(1);
    });
  });
});
