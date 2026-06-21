const request = require('supertest');
const app = require('../app');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Mock Mongoose operations to avoid requiring a running MongoDB server during local test executions
jest.mock('../models/User');
jest.mock('../models/Doctor');
jest.mock('../models/Appointment');
jest.mock('../models/Notification');
jest.mock('../config/db', () => jest.fn()); // mock database connection

describe('Book a Doctor API tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/health', () => {
    it('should return 200 OK and health status', async () => {
      const res = await request(app).get('/api/health');
      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('active and running');
    });
  });

  describe('GET /api/invalid-route', () => {
    it('should return 404 for non-existing endpoints', async () => {
      const res = await request(app).get('/api/invalid-route');
      expect(res.statusCode).toEqual(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toEqual('API Endpoint not found');
    });
  });

  describe('Auth Middleware verification', () => {
    it('should reject requests without a token', async () => {
      const res = await request(app).get('/api/appointments');
      expect(res.statusCode).toEqual(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('no token provided');
    });

    it('should reject requests with an invalid token', async () => {
      const res = await request(app)
        .get('/api/appointments')
        .set('Authorization', 'Bearer invalidtoken123');
      expect(res.statusCode).toEqual(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('token failed');
    });
  });
});
