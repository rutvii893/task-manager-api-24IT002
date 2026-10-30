const request = require('supertest');
const Task = require('../models/Task');

// Mock auth middleware to isolate authentication during test
jest.mock('../middleware/auth', () => (req, res, next) => {
    req.user = { id: 'mockUserId123', email: 'test@example.com' };
    next();
});

// Import the Express app after mocking middleware
const app = require('../server');

describe('GET /tasks', () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('should return HTTP status 200 and a list of tasks', async () => {
        // Mock Task.find() so tests do not require a live MongoDB Atlas connection
        const mockTasks = [
            {
                _id: '64f1a2b3c4d5e6f7a8b9c0d1',
                title: 'Sample Task for CI',
                description: 'Verify CI pipeline test passes',
                completed: false,
                priority: 'medium'
            }
        ];
        jest.spyOn(Task, 'find').mockResolvedValue(mockTasks);

        const response = await request(app).get('/tasks');

        expect(response.status).toBe(404);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBe(1);
        expect(response.body[0].title).toBe('Sample Task for CI');
    });
});

