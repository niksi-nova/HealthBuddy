import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Google Gemini AI Configuration
 * Initializes Gemini API for text generation and embeddings
 */

// GEMINI_API_KEY is loaded from .env via dotenv in server.js


const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Model for text generation (chat responses)
export const getGenerativeModel = () => {
    return genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        generationConfig: {
            temperature: 0.3, // Lower temperature for more factual responses
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
        },
    });
};

// Model for embeddings (vector search)
export const getEmbeddingModel = () => {
    return genAI.getGenerativeModel({
        model: 'text-embedding-004' // Latest embedding model
    });
};

export default genAI;
