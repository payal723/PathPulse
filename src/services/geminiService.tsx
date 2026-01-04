
import { GoogleGenAI, Type } from "@google/genai";
import type { CareerGuide, InterviewFeedback, AIRecommendation, InterviewQuestion } from "../types";

// Always use gemini-3-pro-preview for complex reasoning tasks like career roadmap generation and evaluation.
// Basic tasks like generating questions can use gemini-3-flash-preview.

export const generateCareerRoadmap = async (role: string): Promise<CareerGuide> => {
  // Use the API key directly from process.env.API_KEY as per guidelines.
 const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_API_KEY });
  const response = await ai.models.generateContent({
   model: "gemini-3-flash-preview",
    contents: `Generate a professional, documentation-heavy career guide for: ${role}.
    Requirements:
    1. Divide documentation into 4 sections: 'Introduction', 'Core Philosophy', 'Modern Tech Stack', 'Industry Best Practices'.
    2. Create an advanced roadmap with 3 phases (Basic, Intermediate, Advanced).
    3. Each roadmap node MUST include: duration, importance, a 'Project Idea' (practical task), and 'Salary Impact' (Low/Medium/High).
    4. Provide specific high-quality reading resources.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          role: { type: Type.STRING },
          overview: { type: Type.STRING },
          salaryExpectation: { type: Type.STRING },
          difficulty: { type: Type.STRING },
          growthPotential: { type: Type.STRING },
          detailedDocs: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                content: { type: Type.STRING }
              },
              required: ["title", "content"]
            }
          },
          prosAndCons: {
            type: Type.OBJECT,
            properties: {
              pros: { type: Type.ARRAY, items: { type: Type.STRING } },
              cons: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["pros", "cons"]
          },
          essentialReading: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                summary: { type: Type.STRING },
                link: { type: Type.STRING },
                author: { type: Type.STRING }
              },
              required: ["title", "summary", "link"]
            }
          },
          roadmap: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                label: { type: Type.STRING },
                description: { type: Type.STRING },
                phase: { type: Type.STRING, enum: ['Basic', 'Intermediate', 'Advanced'] },
                duration: { type: Type.STRING },
                importance: { type: Type.STRING, enum: ['Critical', 'Recommended', 'Optional'] },
                projectIdea: { type: Type.STRING },
                salaryImpact: { type: Type.STRING, enum: ['Low', 'Medium', 'High'] },
                subskills: { type: Type.ARRAY, items: { type: Type.STRING } },
                resources: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING },
                      url: { type: Type.STRING },
                      type: { type: Type.STRING, enum: ['Video', 'Article', 'Course'] }
                    },
                    required: ["name", "url", "type"]
                  }
                }
              },
              required: ["id", "label", "description", "phase", "subskills", "resources", "duration", "importance", "projectIdea", "salaryImpact"]
            }
          }
        },
        required: ["role", "overview", "salaryExpectation", "difficulty", "detailedDocs", "prosAndCons", "essentialReading", "roadmap", "growthPotential"]
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("AI returned empty content");
  
  // Directly trim and parse JSON from response.text property.
  return JSON.parse(text.trim());
};

export const generateInterviewQuestions = async (role: string, level: string): Promise<InterviewQuestion[]> => {
  const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Generate 5 technical interview questions for a ${level} level ${role}.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.NUMBER },
            question: { type: Type.STRING },
            category: { type: Type.STRING }
          },
          required: ["id", "question", "category"]
        }
      }
    }
  });

  const text = response.text;
  return text ? JSON.parse(text.trim()) : [];
};

export const evaluateInterview = async (role: string, level: string, QAs: { question: string, answer: string }[]): Promise<InterviewFeedback> => {
  const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_API_KEY });
  const qaString = QAs.map(qa => `Q: ${qa.question}\nA: ${qa.answer}`).join('\n\n');
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: `Evaluate these interview answers for a ${level} ${role} role:\n\n${qaString}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          score: { type: Type.NUMBER },
          strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
          weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
          improvementTips: { type: Type.STRING }
        },
        required: ["score", "strengths", "weaknesses", "improvementTips"]
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("Evaluation failed");
  return JSON.parse(text.trim());
};

export const getAIRecommendations = async (interests: string): Promise<AIRecommendation[]> => {
  const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_API_KEY });
  const response = await ai.models.generateContent({
   model: "gemini-3-flash-preview",
    contents: `Based on these interests: "${interests}", recommend 3 modern career paths.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            role: { type: Type.STRING },
            reason: { type: Type.STRING },
            suitability: { type: Type.NUMBER }
          },
          required: ["role", "reason", "suitability"]
        }
      }
    }
  });

  const text = response.text;
  return text ? JSON.parse(text.trim()) : [];
};
