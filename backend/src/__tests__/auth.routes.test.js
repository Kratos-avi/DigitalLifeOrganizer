const request = require('supertest');
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authRoutes = require('../routes/auth.routes');

// Mock database
jest.mock('../config/db', () => ({
  query: jest.fn(),
}));

// Mock data module
jest.mock('../data/starterTasks', () => [
  { title: 'Welcome Task', description: 'First task', due_days: 7 },
]);

const mockDb = require('../config/db');

describe('Auth Routes', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/auth', authRoutes);
    jest.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      mockDb.query
        .mockResolvedValueOnce([[]])  // Check if email exists
        .mockResolvedValueOnce([{ insertId: 5 }])  // Insert user
        .mockResolvedValueOnce([{}]);  // Insert starter task

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          full_name: 'John Doe',
          email: 'john@test.com',
          password: 'password123',
          role: 'newcomer',
        });

      expect(res.status).toBe(201);
      expect(res.body.message).toBe('Registered');
      expect(res.body.token).toBeDefined();
      expect(res.body.user.email).toBe('john@test.com');
      expect(res.body.user.role).toBe('newcomer');
    });

    it('should reject duplicate email', async () => {
      mockDb.query.mockResolvedValueOnce([
        [{ id: 1 }]  // Email already exists
      ]);

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          full_name: 'Jane Doe',
          email: 'jane@test.com',
          password: 'password123',
          role: 'newcomer',
        });

      expect(res.status).toBe(409);
      expect(res.body.message).toBe('Email already exists');
    });

    it('should reject missing required fields', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@test.com',
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('required');
    });

    it('should force role to newcomer if not admin', async () => {
      mockDb.query
        .mockResolvedValueOnce([[]])
        .mockResolvedValueOnce([{ insertId: 6 }])
        .mockResolvedValueOnce([{}]);

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          full_name: 'Bob User',
          email: 'bob@test.com',
          password: 'pass123',
          role: 'superuser',  // Invalid role
        });

      expect(res.status).toBe(201);
      expect(res.body.user.role).toBe('newcomer');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login user with valid credentials', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      const user = {
        id: 1,
        email: 'test@test.com',
        password_hash: hashedPassword,
        role: 'newcomer',
      };

      mockDb.query.mockResolvedValueOnce([[user]]);

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@test.com',
          password: 'password123',
        });

      expect(res.status).toBe(200);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.email).toBe('test@test.com');
    });

    it('should reject invalid password', async () => {
      const hashedPassword = await bcrypt.hash('correctpassword', 10);
      mockDb.query.mockResolvedValueOnce([[{
        id: 1,
        email: 'test@test.com',
        password_hash: hashedPassword,
        role: 'newcomer',
      }]]);

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@test.com',
          password: 'wrongpassword',
        });

      expect(res.status).toBe(401);
      expect(res.body.message).toContain('Invalid');
    });

    it('should reject non-existent user', async () => {
      mockDb.query.mockResolvedValueOnce([[]]);

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@test.com',
          password: 'password123',
        });

      expect(res.status).toBe(401);
    });

    it('should reject missing credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@test.com',
        });

      expect(res.status).toBe(400);
    });
  });
});
