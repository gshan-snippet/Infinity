import { GoogleGenerativeAI } from "@google/generative-ai";

// Lazily initialize the client so dotenv can load env vars first
export function getModel() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is missing");
  }

  // Initialize client (pass API key as string)
  const genAI = new GoogleGenerativeAI(apiKey);
  const MODEL_NAME = process.env.GEMINI_MODEL || "models/gemini-2.5-flash";

  return genAI.getGenerativeModel({ model: MODEL_NAME });
}



