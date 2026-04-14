const jwt = require('jsonwebtoken');
const { protect, authorize } = require('../middleware/auth');

describe('Auth Middleware', () => {
  describe('protect middleware', () => {
    it('should reject request with no token', () => {
      const req = { headers: {} };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      protect(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'No token provided' });
      expect(next).not.toHaveBeenCalled();
    });

    it('should reject request with malformed authorization header', () => {
      const req = { headers: { authorization: 'InvalidHeader' } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      protect(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'No token provided' });
    });

    it('should accept valid JWT token', () => {
      const token = jwt.sign(
        { id: 1, email: 'test@test.com', role: 'newcomer' },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      const req = { headers: { authorization: `Bearer ${token}` } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      protect(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.user).toEqual({
        id: 1,
        email: 'test@test.com',
        role: 'newcomer',
        iat: expect.any(Number),
        exp: expect.any(Number),
      });
    });

    it('should reject expired token', () => {
      const token = jwt.sign(
        { id: 1, email: 'test@test.com', role: 'newcomer' },
        process.env.JWT_SECRET,
        { expiresIn: '-1s' }
      );

      const req = { headers: { authorization: `Bearer ${token}` } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      protect(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Invalid token' });
    });

    it('should reject token with invalid signature', () => {
      const token = jwt.sign(
        { id: 1, email: 'test@test.com', role: 'newcomer' },
        'different-secret'
      );

      const req = { headers: { authorization: `Bearer ${token}` } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      protect(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Invalid token' });
    });
  });

  describe('authorize middleware', () => {
    it('should allow authorized role', () => {
      const req = { user: { id: 1, role: 'admin' } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      const middleware = authorize('admin');
      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should deny unauthorized role', () => {
      const req = { user: { id: 1, role: 'newcomer' } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      const middleware = authorize('admin');
      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ message: 'Access denied' });
      expect(next).not.toHaveBeenCalled();
    });

    it('should allow multiple roles', () => {
      const req = { user: { id: 1, role: 'newcomer' } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      const middleware = authorize('admin', 'newcomer');
      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should deny if user is not present', () => {
      const req = { user: null };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      const middleware = authorize('admin');
      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
    });
  });
});
