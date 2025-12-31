import { GoogleGenAI, Type } from "@google/genai";
import type { PlacedGoal} from "../types/types";
import { MONTHS } from '../types/types';

// Helper to check if API key exists
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;



export const generateGoalSchedule = async (
  placedGoals: PlacedGoal[], 
  userName: string
): Promise<PlacedGoal[]> => {
  if (!API_KEY) {
    console.warn("No API Key found. Returning raw goals without AI suggestions.");
    return placedGoals.map(g => ({
      ...g,
      suggestion: "Set a specific time each day.",
      frequency: "Weekly",
    }));
  }

  const ai = new GoogleGenAI({
    apiKey: API_KEY,
  });

  const goalsDescription = placedGoals.map(g => 
    `- ${g.title} starting in ${MONTHS[g.monthIndex]} 2026`
  ).join('\n');

  const prompt = `
    User ${userName} is planning their 2026.
    Here are their goals and start dates:
    ${goalsDescription}

    For each goal, provide a specific actionable suggestion (max 10 words) and a recommended frequency (e.g., "3x/week", "Daily", "Monthly").
    Also provide a very short 10-word motivational quote for the whole year.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            goalDetails: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  originalTitle: { type: Type.STRING },
                  suggestion: { type: Type.STRING },
                  frequency: { type: Type.STRING }
                }
              }
            },
            yearlyMotivation: { type: Type.STRING }
          }
        }
      }
    });

    const result = JSON.parse(response.text || '{}');
    const details = result.goalDetails || [];

    // Merge AI results back into placed goals
    return placedGoals.map(goal => {
      const match = details.find((d: any) => 
        goal.title.toLowerCase().includes(d.originalTitle.toLowerCase()) || 
        d.originalTitle.toLowerCase().includes(goal.title.toLowerCase())
      );
      return {
        ...goal,
        suggestion: match?.suggestion || "Commit to consistency.",
        frequency: match?.frequency || "Regularly"
      };
    });

  } catch (error) {
    console.error("Gemini API Error:", error);
    // Fallback if AI fails
    return placedGoals.map(g => ({
        ...g,
        suggestion: "Stay consistent.",
        frequency: "Weekly"
    }));
  }
};