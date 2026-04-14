const request = require('supertest');
const express = require('express');
const taskRoutes = require('../routes/tasks.routes');

// Mock database
jest.mock('../config/db', () => ({
  query: jest.fn(),
}));

const mockDb = require('../config/db');

// Mock auth middleware
jest.mock('../middleware/auth', () => {
  const jwt = require('jsonwebtoken');
  return {
    protect: (req, res, next) => {
      const token = req.headers.authorization?.split(' ')[1];
      if (token) {
        try {
          req.user = jwt.verify(token, process.env.JWT_SECRET);
          next();
        } catch (err) {
          res.status(401).json({ message: 'Invalid token' });
        }
      } else {
        res.status(401).json({ message: 'No token provided' });
      }
    },
    authorize: (...roles) => (req, res, next) => {
      if (roles.includes(req.user?.role)) {
        next();
      } else {
        res.status(403).json({ message: 'Access denied' });
      }
    },
  };
});

describe('Tasks Routes', () => {
  let app;
  let validToken;
  let adminToken;

  beforeEach(() => {
    const jwt = require('jsonwebtoken');
    
    app = express();
    app.use(express.json());
    app.use('/api/tasks', taskRoutes);

    // Generate test tokens
    validToken = jwt.sign(
      { id: 1, email: 'user@test.com', role: 'newcomer' },
      process.env.JWT_SECRET
    );
    adminToken = jwt.sign(
      { id: 2, email: 'admin@test.com', role: 'admin' },
      process.env.JWT_SECRET
    );

    jest.clearAllMocks();
  });

  describe('GET /api/tasks', () => {
    it('should fetch tasks for authenticated user', async () => {
      mockDb.query
        .mockResolvedValueOnce([[{ total: 1 }]])
        .mockResolvedValueOnce([[
          {
            id: 1,
            title: 'Test Task',
            description: 'A test task',
            status: 'pending',
            created_at: '2024-01-01',
          },
        ]]);

      const res = await request(app)
        .get('/api/tasks')
        .set('Authorization', `Bearer ${validToken}`);

      expect(res.status).toBe(200);
      expect(res.body.tasks).toHaveLength(1);
      expect(res.body.tasks[0].title).toBe('Test Task');
    });

    it('should require authentication', async () => {
      const res = await request(app).get('/api/tasks');

      expect(res.status).toBe(401);
    });

    it('should filter by search query', async () => {
      mockDb.query
        .mockResolvedValueOnce([[{ total: 1 }]])
        .mockResolvedValueOnce([[{ id: 1, title: 'Buy groceries' }]]);

      const res = await request(app)
        .get('/api/tasks?q=buy')
        .set('Authorization', `Bearer ${validToken}`);

      expect(res.status).toBe(200);
      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('LIKE'),
        expect.arrayContaining(['%buy%'])
      );
    });

    it('should filter by status', async () => {
      mockDb.query
        .mockResolvedValueOnce([[{ total: 1 }]])
        .mockResolvedValueOnce([[{ id: 1, title: 'Task', status: 'completed' }]]);

      const res = await request(app)
        .get('/api/tasks?status=completed')
        .set('Authorization', `Bearer ${validToken}`);

      expect(res.status).toBe(200);
    });

    it('should support pagination', async () => {
      mockDb.query
        .mockResolvedValueOnce([[{ total: 20 }]])
        .mockResolvedValueOnce([[{ id: 1, title: 'Task 1' }]]);

      const res = await request(app)
        .get('/api/tasks?page=2&limit=10')
        .set('Authorization', `Bearer ${validToken}`);

      expect(res.status).toBe(200);
      expect(res.body.page).toBe(2);
      expect(res.body.limit).toBe(10);
    });
  });

  describe('POST /api/tasks', () => {
    it('should create a new task', async () => {
      mockDb.query.mockResolvedValueOnce([{ insertId: 5 }]);

      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${validToken}`)
        .send({
          title: 'New Task',
          description: 'Task description',
        });

      expect(res.status).toBe(201);
      expect(res.body.message).toBe('Task created');
    });

    it('should require title', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${validToken}`)
        .send({
          description: 'No title provided',
        });

      expect(res.status).toBe(400);
    });
  });

  describe('PUT /api/tasks/:id', () => {
    it('should update a task', async () => {
      mockDb.query
        .mockResolvedValueOnce([[{ id: 1, title: 'Old Task', status: 'pending' }]])  // SELECT task
        .mockResolvedValueOnce([{}]);  // UPDATE task

      const res = await request(app)
        .put('/api/tasks/1')
        .set('Authorization', `Bearer ${validToken}`)
        .send({
          title: 'Updated Task',
          status: 'completed',
        });

      expect(res.status).toBe(200);
    });

    it('should return 404 for non-existent task', async () => {
      mockDb.query.mockResolvedValueOnce([[]]);  // No task found

      const res = await request(app)
        .put('/api/tasks/999')
        .set('Authorization', `Bearer ${validToken}`)
        .send({ title: 'Updated' });

      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /api/tasks/:id', () => {
    it('should delete a task', async () => {
      mockDb.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

      const res = await request(app)
        .delete('/api/tasks/1')
        .set('Authorization', `Bearer ${validToken}`);

      expect(res.status).toBe(200);
    });

    it('should return 404 for non-existent task', async () => {
      mockDb.query.mockResolvedValueOnce([{ affectedRows: 0 }]);

      const res = await request(app)
        .delete('/api/tasks/999')
        .set('Authorization', `Bearer ${validToken}`);

      expect(res.status).toBe(404);
    });
  });
});
