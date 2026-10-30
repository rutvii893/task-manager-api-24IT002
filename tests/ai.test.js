const request = require('supertest');
const aiService = require('../services/aiService');

// Mock aiService module
jest.mock('../services/aiService', () => ({
    generateTaskDescription: jest.fn()
}));

const app = require('../server');

describe('POST /api/ai/generate-description', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should return 400 when task title is missing or empty', async () => {
        const response = await request(app)
            .post('/api/ai/generate-description')
            .send({ title: '' });

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Task title is required to generate a description.');
    });

    it('should return 200 and description when Gemini AI service generates successfully', async () => {
        const mockDescription = 'Integrate database and configure endpoints.';
        aiService.generateTaskDescription.mockResolvedValueOnce(mockDescription);

        const response = await request(app)
            .post('/api/ai/generate-description')
            .send({ title: 'Complete Database Integration' });

        expect(response.status).toBe(200);
        expect(response.body.description).toBe(mockDescription);
    });

    it('should return 503 safe fallback when Gemini AI service fails (graceful degradation)', async () => {
        aiService.generateTaskDescription.mockRejectedValueOnce(new Error('Gemini API quota exceeded or key invalid'));

        const response = await request(app)
            .post('/api/ai/generate-description')
            .send({ title: 'Deploy Container Stack' });

        expect(response.status).toBe(503);
        expect(response.body.fallback).toBe(true);
        expect(response.body.error).toContain('AI service currently unavailable');
    });
});
