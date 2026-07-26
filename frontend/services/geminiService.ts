import { GoogleGenAI, Type } from '@google/genai';
import { TranscriptLine, SuggestedAnswer, AnticipatedQuestion } from '../types';

// Initialize the SDK. Assumes process.env.API_KEY is available in the environment.
const apiKey = typeof process !== 'undefined' && process.env ? process.env.API_KEY : 'dummy-key';
const ai = new GoogleGenAI({ apiKey });

export const generateCopilotSuggestions = async (
  transcript: TranscriptLine[]
): Promise<{ answer: SuggestedAnswer | null; questions: AnticipatedQuestion[] }> => {
  if (transcript.length === 0) return { answer: null, questions: [] };

  const conversationText = transcript
    .map((t) => `${t.role}: ${t.text}`)
    .join('\n');

  const prompt = `
    You are Desk-AI, a real-time assistant for a user on a call with a client.
    Analyze the following conversation transcript.
    
    1. Identify the client's most recent question or implied need.
    2. Provide a suggested answer for the user to say. Provide a 'short' version (1 sentence) and a 'detailed' version.
    3. Anticipate 2-3 likely follow-up questions the client might ask next.
    
    Transcript:
    ${conversationText}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            answer: {
              type: Type.OBJECT,
              properties: {
                short: { type: Type.STRING, description: "A concise, one-sentence response." },
                detailed: { type: Type.STRING, description: "A more thorough explanation." },
                confidence: { type: Type.NUMBER, description: "Confidence score from 0 to 1." }
              },
              required: ["short", "detailed", "confidence"]
            },
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  question: { type: Type.STRING }
                },
                required: ["id", "question"]
              }
            }
          },
          required: ["answer", "questions"]
        }
      }
    });

    if (response.text) {
      const parsed = JSON.parse(response.text);
      return {
        answer: parsed.answer,
        questions: parsed.questions
      };
    }
  } catch (error) {
    console.error("Error generating suggestions:", error);
  }
  return { answer: null, questions: [] };
};

export const analyzeScreenForGuidance = async (
  base64Image: string,
  userQuery: string
): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        role: 'user',
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: base64Image.split(',')[1] // Remove data URL prefix
            }
          },
          {
            text: `The user is asking: "${userQuery}". Look at this screenshot of their current application. Provide step-by-step instructions on what they should do next. Be concise.`
          }
        ]
      }
    });
    return response.text || "Could not analyze screen.";
  } catch (error) {
    console.error("Error analyzing screen:", error);
    return "Error analyzing screen.";
  }
};
