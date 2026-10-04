import axios from 'axios';
import { UserProfile, CarbonData } from '../types';

export const aiService = {
  getCoachAdvice: async (prompt: string, userProfile: UserProfile, carbonData: CarbonData) => {
    try {
      const response = await axios.post('/api/gemini/coach', {
        prompt,
        userProfile,
        footprint: carbonData.breakdown,
        totalFootprint: carbonData.total,
        budget: carbonData.budget
      });
      return response.data.text;
    } catch (error) {
      console.error("AI Coach Error:", error);
      return "I'm having trouble connecting to my database. Let's try again in a bit!";
    }
  },

  getChatResponse: async (messages: { role: string, content: string }[], userProfile: UserProfile, carbonData: CarbonData) => {
    try {
      const response = await axios.post('/api/gemini/chat', {
        messages,
        userProfile,
        carbonData
      });
      return response.data.text;
    } catch (error) {
      console.error("EcoAgent AI Error:", error);
      throw error;
    }
  },

  getScenarioAnalysis: async (prompt: string, userProfile: UserProfile, currentFootprint: number) => {
    try {
      const response = await axios.post('/api/gemini/whatif', {
        prompt,
        userProfile,
        currentFootprint
      });
      return response.data.text;
    } catch (error) {
      console.error("Scenario Analysis Error:", error);
      return "Analysis unavailable at the moment.";
    }
  }
};
