const request = require('supertest');
const User = require('../models/User');
const app = require('../server');

describe('POST /auth/login', () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('should return HTTP status 401 when user is not found (invalid credentials)', async () => {
        // Mock User.findOne to resolve to null (simulating non-existent user)
        jest.spyOn(User, 'findOne').mockResolvedValue(null);

        const response = await request(app)
            .post('/auth/login')
            .send({
                email: 'nonexistent@example.com',
                password: 'wrongpassword'
            });

        expect(response.status).toBe(401);
        expect(response.body).toEqual({
            success: false,
            message: 'Invalid credentials'
        });
    });
});

