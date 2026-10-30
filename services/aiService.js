const { GoogleGenAI } = require('@google/genai');

/**
 * AI Service for generating task descriptions using Google Gemini API (gemini-2.5-flash)
 */
async function generateTaskDescription(title) {
    const apiKey = process.env.GEMINI_API_KEY;

    // Guard: Check if Gemini API key is configured and not a placeholder
    if (!apiKey || apiKey === 'your_gemini_api_key_here' || apiKey.includes('your_')) {
        const error = new Error('Gemini API key not configured or set to placeholder.');
        error.code = 'GEMINI_KEY_MISSING';
        throw error;
    }

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `Generate a single, clear, actionable, professional 1-2 sentence description for a task titled "${title}". Only return the description text without markdown quotes or conversational preamble.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            systemInstruction: 'You are an assistant for a task management app that writes concise, professional 1-2 sentence task descriptions.',
            maxOutputTokens: 300,
            temperature: 0.7
        }
    });

    const description = response.text ? response.text.trim() : null;
    if (!description) {
        throw new Error('No content returned from Gemini API');
    }

    return description;
}

module.exports = {
    generateTaskDescription
};
