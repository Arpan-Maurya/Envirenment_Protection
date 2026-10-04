import { describe, it, expect } from 'vitest';
import { COLORS, CATEGORY_ICONS } from '../lib/constants';

describe('constants', () => {
  it('has colors', () => {
    expect(COLORS.length).toBeGreaterThan(0);
  });
  it('has icons', () => {
    expect(Object.keys(CATEGORY_ICONS).length).toBeGreaterThan(0);
  });
});
