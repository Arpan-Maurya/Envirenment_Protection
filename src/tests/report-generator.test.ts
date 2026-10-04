import { describe, it, expect, vi } from 'vitest';
import { generatePDFReport } from '../lib/report-generator';
import { UserProfile, CarbonData } from '../types';

vi.mock('jspdf', () => {
  return {
    jsPDF: vi.fn().mockImplementation(() => ({
      setFillColor: vi.fn(),
      rect: vi.fn(),
      setFontSize: vi.fn(),
      setTextColor: vi.fn(),
      setFont: vi.fn(),
      text: vi.fn(),
      setDrawColor: vi.fn(),
      line: vi.fn(),
      save: vi.fn(),
    }))
  };
});

describe('generatePDFReport', () => {
  it('generates a pdf report without errors', () => {
    const mockUser = { name: 'Test', city: 'City', level: 1, xp: 0 } as unknown as UserProfile;
    const mockData = { total: 100, budget: 150, spent: 100, breakdown: { Transport: 50, Food: 50 } } as unknown as CarbonData;
    
    expect(() => generatePDFReport(mockUser, mockData)).not.toThrow();
  });
});
