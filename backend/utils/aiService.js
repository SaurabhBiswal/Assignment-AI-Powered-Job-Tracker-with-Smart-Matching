
import { GoogleGenerativeAI } from "@google/generative-ai";

let genAI = null;
let model = null;

// Initialize Gemini
export const initializeAI = () => {
    if (!process.env.GEMINI_API_KEY) {
        console.warn("GEMINI_API_KEY is missing in .env");
        return;
    }
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
};

export const generateMatchScore = async (resumeText, jobDescription) => {
    if (!model) initializeAI();
    if (!model) return null;

    try {
        const prompt = `
        You are an AI Job Matcher. compare the following Resume and Job Description.
        
        Resume:
        ${resumeText.substring(0, 3000)}
        
        Job Description:
        ${jobDescription.substring(0, 3000)}
        
        Output a JSON object ONLY:
        {
            "matchScore": <number 0-100>,
            "explanation": "<short 1 sentence reason>"
        }
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Cleanup markdown if present
        const jsonString = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(jsonString);

    } catch (error) {
        console.error("AI Match Error:", error);
        return { matchScore: 0, explanation: "AI matching failed." };
    }
};

export const chatWithAI = async (message, context) => {
    if (!model) initializeAI();
    if (!model) return "AI Service Unavailable";

    try {
        const prompt = `
        System: You are a helpful Job Assistant. 
        Context: ${JSON.stringify(context)}
        User: ${message}
        
        Answer concisely.
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("AI Chat Error:", error);
        return "Sorry, I couldn't process that.";
    }
};
