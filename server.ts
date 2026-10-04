import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { calculateFootprint } from "./src/lib/carbon-engine";
import { generateRecommendations } from "./src/lib/recommendation-engine";
import { simulateScenario } from "./src/lib/simulator-engine";
import { generateWeeklyMissions } from "./src/lib/mission-engine";

dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  console.error("CRITICAL: GEMINI_API_KEY environment variable is not set. Server startup aborted.");
  process.exit(1);
}

const ai = new GoogleGenAI({
  apiKey: GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// --- Simple in-memory rate limiter (per IP) ---
const WINDOW_MS = 60 * 1000;
const rateBuckets = new Map<string, { count: number; resetAt: number }>();

function rateLimit(maxRequests: number) {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const bucket = rateBuckets.get(ip);
    const now = Date.now();
    if (!bucket || bucket.resetAt < now) {
      rateBuckets.set(ip, { count: 1, resetAt: now + WINDOW_MS });
      return next();
    }
    bucket.count += 1;
    if (bucket.count > maxRequests) {
      return res.status(429).json({ error: "Too many requests. Please slow down." });
    }
    return next();
  };
}

// Bound the request log to method + path only (never bodies/headers).
function safeUrl(url: string): string {
  try {
    return new URL(url, "http://localhost").pathname;
  } catch {
    return url;
  }
}

function sanitizeAIInput(input: string): string {
  if (!input) return "";
  const patterns = [
    /ignore prior/i,
    /ignore previous/i,
    /ignore all instructions/i,
    /system instruction/i,
    /forget everything/i,
    /you are now a/i,
    /override/i,
    /jailbreak/i,
    /dan mode/i
  ];
  
  let cleaned = input;
  for (const pattern of patterns) {
    if (pattern.test(cleaned)) {
      cleaned = cleaned.replace(pattern, "[removed injection attempt]");
    }
  }
  return cleaned;
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.set('trust proxy', 1);
  app.use(express.json({ limit: '256kb' }));

  // Request logging middleware — method + path only (no bodies, headers or tokens).
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${safeUrl(req.url)}`);
    next();
  });

  // Basic defense-in-depth security headers.
  // NOTE: COOP must be `same-origin-allow-popups`, NOT `same-origin`.
  // `same-origin` severs `window.opener` in cross-origin popups, which breaks
  // Firebase Auth's popup sign-in: the OAuth handler page cannot relay the
  // auth event back to the app, the popup closes and Firebase rejects with
  // `auth/popup-closed-by-user`.
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
    res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
    res.removeHeader('X-Powered-By');
    next();
  });

  // --- CARBON ENGINE API ---
  app.post("/api/carbon/calculate", (req, res) => {
    try {
      const { profile } = req.body;
      if (!profile) return res.status(400).json({ error: "Profile required" });
      const rawBreakdown = calculateFootprint(profile);
      const breakdown = {
        "Transport": Math.round(rawBreakdown["Transport"] || 0),
        "Home Energy": Math.round(rawBreakdown["Home Energy"] || 0),
        "Food": Math.round(rawBreakdown["Food"] || 0),
        "Shopping": Math.round(rawBreakdown["Shopping"] || 0),
        "Waste": Math.round(rawBreakdown["Waste"] || 0),
      };
      const total = Object.values(breakdown).reduce((a, b) => a + b, 0);
      res.json({ total, breakdown, score: 100 - (total / 10) });
    } catch (err) {
      const error = err as Error;
      console.error("Calculate Error:", error);
      res.status(500).json({ error: "Calculation failed" });
    }
  });

  // --- RECOMMENDATION ENGINE API ---
  app.post("/api/recommendations", (req, res) => {
    try {
      const { profile, footprint, completedIds } = req.body;
      if (!profile || !footprint) return res.status(400).json({ error: "Profile and footprint required" });
      const recommendations = generateRecommendations(profile, footprint, completedIds);
      res.json(recommendations);
    } catch (err) {
      const error = err as Error;
      console.error("Recommendations Error:", error);
      res.status(500).json({ error: "Failed to generate recommendations" });
    }
  });

  // --- SIMULATOR API ---
  app.post("/api/simulator", (req, res) => {
    try {
      const { profile, scenario } = req.body;
      if (!profile || !scenario) return res.status(400).json({ error: "Profile and scenario required" });
      const result = simulateScenario(profile, scenario);
      res.json(result);
    } catch (err) {
      const error = err as Error;
      console.error("Simulator Error:", error);
      res.status(500).json({ error: "Simulation failed" });
    }
  });

  // --- MISSIONS API ---
  app.post("/api/missions", (req, res) => {
    try {
      const { profile } = req.body;
      if (!profile) return res.status(400).json({ error: "Profile required" });
      const missions = generateWeeklyMissions(profile);
      res.json(missions);
    } catch (err) {
      const error = err as Error;
      console.error("Missions Error:", error);
      res.status(500).json({ error: "Failed to fetch missions" });
    }
  });

  // --- XP RATELIMITING & AWARD API ---
  const XP_LIMITS: Record<string, number> = {
    habit: 5, action: 15, mission: 100, level_bonus: 0
  };

  app.post("/api/xp/award", (req, res) => {
    try {
      const { action, xpGain, ecoPointsGain } = req.body;
      if (!action) return res.status(400).json({ error: "Action is required" });
      
      const maxXP = XP_LIMITS[action];
      if (maxXP === undefined) {
        return res.status(400).json({ error: `Unknown award action: ${action}` });
      }

      if (xpGain > maxXP) {
        return res.status(400).json({ 
          error: `Rejected: xpGain ${xpGain} exceeds backend limit ${maxXP} for ${action}` 
        });
      }

      return res.json({
        verified: true,
        xpGain,
        ecoPointsGain
      });
    } catch (err) {
      const error = err as Error;
      console.error("XP Award Error:", error);
      res.status(500).json({ error: "Failed to validate XP award" });
    }
  });

  // API Route for AI Coach
  app.post("/api/gemini/coach", rateLimit(20), async (req, res) => {
    try {
      const { prompt, userProfile, footprint, totalFootprint, budget } = req.body;
      if (!prompt) return res.status(400).json({ error: "Prompt is required" });

      const sanitized = sanitizeAIInput(prompt);

      const context = {
        profile: userProfile,
        footprint,
        total: totalFootprint,
        budget
      };

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        config: {
          systemInstruction: `You are an AI Sustainability Coach for CARBONIQ. 
          Analyze the user's data and provide actionable, encouraging advice.
          Explain recommendations, simulations, and answer sustainability questions.
          Context: ${JSON.stringify(context)}
          Rules:
          1. Be concise and practical.
          2. Use bullet points for steps.
          3. Never perform manual CO2 calculations; explain existing ones.
          4. Focus on the largest emission categories if they exceed 30% of total.`,
        },
        contents: sanitized
      });
      res.json({ text: response.text });
    } catch (err) {
      const error = err as Error;
      console.error("Gemini API Error:", error.message);
      res.status(500).json({ error: "Failed to generate AI response" });
    }
  });

  // Multi-turn Chat API
  app.post("/api/gemini/chat", rateLimit(30), async (req, res) => {
    try {
      const { messages, userProfile, carbonData, recentActivities, activeMissions } = req.body;

      if (!messages || !Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ error: "Messages are required" });
      }

      const sanitized = sanitizeAIInput(String(messages[messages.length - 1].content || ""));
      const chatHistory = messages.slice(0, -1).map((m: {role?: string, content?: string}) => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: String(m.content || "") }]
      }));

      const chat = ai.chats.create({
        model: "gemini-2.5-flash",
        config: {
          systemInstruction: `You are EcoAgent AI, an expert sustainability coach.
          You help users understand and reduce their carbon footprint.
          User Profile: ${JSON.stringify(userProfile || {})}
          Current Footprint: ${JSON.stringify(carbonData || {})}
          Recent Carbon-Saving Activities: ${JSON.stringify(recentActivities || [])}
          Active Sustainable Missions: ${JSON.stringify(activeMissions || [])}
          
          Guidelines:
          - Be friendly, professional and encouraging.
          - Use "we" to emphasize collaboration.
          - Provide specific, data-driven advice when possible based on the user's footprint, their recent carbon-saving activities, and active missions.
          - Try to mention their recent activities (e.g. "Excellent job on completing standard activities") or advocate for completing active missions when pertinent.
          - If asked about specific actions, refer to their current categories (Transport, Energy, etc).
          - Keep responses relatively brief (max 150 words) for mobile readability.`,
        },
        history: chatHistory
      });

      const response = await chat.sendMessage({ message: sanitized });

      res.json({ text: response.text });
    } catch (err) {
      const error = err as Error;
      console.error("[CHAT] ERROR:", error.message);
      res.status(500).json({ error: "Failed to connect to EcoAgent AI" });
    }
  });

  // API Route for analyzing what-if scenarios
  app.post("/api/gemini/whatif", rateLimit(20), async (req, res) => {
    try {
      const { prompt, userProfile, currentFootprint } = req.body;
      if (!prompt) return res.status(400).json({ error: "Prompt is required" });
      const sanitized = sanitizeAIInput(prompt);
      
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        config: {
          systemInstruction: "You are a simulation analyzer for CARBONIQ. Analyze the what-if scenario based on the user's current footprint and profile. Provide a short, structured analysis of the impact. User Profile: " + JSON.stringify(userProfile || {}) + " Current Footprint: " + currentFootprint + " kg CO2e. Respond in concise bullet points.",
        },
        contents: sanitized
      });
      res.json({ text: response.text });
    } catch (err) {
      const error = err as Error;
      console.error("Gemini API Error:", error.message);
      res.status(500).json({ error: "Failed to analyze scenario" });
    }
  });

  // API Route for search grounding
  app.post("/api/gemini/search", rateLimit(15), async (req, res) => {
    try {
      const { prompt } = req.body;
      if (!prompt) return res.status(400).json({ error: "Prompt is required" });
      const sanitized = sanitizeAIInput(prompt);
      
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: sanitized,
        config: {
          tools: [{ googleSearch: {} }]
        }
      });
      res.json({ text: response.text });
    } catch (err) {
      const error = err as Error;
      console.error("Gemini Search API Error:", error.message);
      res.status(500).json({ error: "Failed to search" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch(err => {
  console.error("CRITICAL: Server crashed during startup!", err);
});
