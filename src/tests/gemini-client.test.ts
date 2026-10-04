import { describe, it, expect, vi, beforeEach } from 'vitest';
import { aiService } from '../lib/gemini-client';
import { UserProfile, CarbonData } from '../types';
import axios from 'axios';

vi.mock('axios');


describe('gemini-client', () => {
  const dummyUser = {} as UserProfile;
  const dummyData = { breakdown: {}, total: 100, budget: 200 } as CarbonData;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getCoachAdvice returns text on success', async () => {
    vi.mocked(axios.post).mockResolvedValueOnce({ data: { text: 'Coach advice' } });
    const response = await aiService.getCoachAdvice('test', dummyUser, dummyData);
    expect(response).toBe('Coach advice');
  });

  it('getCoachAdvice returns fallback on error', async () => {
    vi.mocked(axios.post).mockRejectedValueOnce(new Error('Network error'));
    const response = await aiService.getCoachAdvice('test', dummyUser, dummyData);
    expect(typeof response).toBe('string');
  });

  it('getScenarioAnalysis returns text on success', async () => {
    vi.mocked(axios.post).mockResolvedValueOnce({ data: { text: 'Scenario analysis' } });
    const response = await aiService.getScenarioAnalysis('test', dummyUser, 100);
    expect(response).toBe('Scenario analysis');
  });

  it('getScenarioAnalysis returns fallback on error', async () => {
    vi.mocked(axios.post).mockRejectedValueOnce(new Error('Network error'));
    const response = await aiService.getScenarioAnalysis('test', dummyUser, 100);
    expect(typeof response).toBe('string');
  });

  it('getChatResponse returns text on success', async () => {
    vi.mocked(axios.post).mockResolvedValueOnce({ data: { text: 'Chat response' } });
    const response = await aiService.getChatResponse([{ role: 'user', content: 'hello' }], dummyUser, dummyData);
    expect(response).toBe('Chat response');
  });

  it('getChatResponse throws on error', async () => {
    vi.mocked(axios.post).mockRejectedValueOnce(new Error('Network error'));
    await expect(aiService.getChatResponse([], dummyUser, dummyData)).rejects.toThrow('Network error');
  });
});
