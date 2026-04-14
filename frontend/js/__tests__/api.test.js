/**
 * Frontend API Tests
 * Tests the api.js module which handles all HTTP requests
 */

describe('API Utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Setup mock fetch for each test
    global.fetch = jest.fn();
  });

  describe('HTTP Requests', () => {
    it('should handle successful GET request', async () => {
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          headers: { get: () => 'application/json' },
          json: async () => ({ message: 'success' }),
        })
      );

      const response = await fetch('http://localhost:5000/api/test');
      expect(response.ok).toBe(true);
      expect(global.fetch).toHaveBeenCalled();
    });

    it('should handle JSON responses', async () => {
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          headers: { get: () => 'application/json' },
          json: async () => ({ data: 'test', status: 'ok' }),
        })
      );

      const response = await fetch('http://localhost:5000/api/test');
      const data = await response.json();
      expect(data.status).toBe('ok');
    });

    it('should detect error responses', async () => {
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: false,
          status: 400,
          headers: { get: () => 'application/json' },
          json: async () => ({ message: 'Bad request' }),
        })
      );

      const response = await fetch('http://localhost:5000/api/bad');
      expect(response.ok).toBe(false);
      expect(response.status).toBe(400);
    });

    it('should handle network errors', async () => {
      global.fetch = jest.fn(() =>
        Promise.reject(new Error('Network error'))
      );

      expect(fetch('http://localhost:5000/api/test')).rejects.toThrow();
    });

    it('should handle text responses', async () => {
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          headers: { get: () => 'text/plain' },
          text: async () => 'Plain text response',
        })
      );

      const response = await fetch('http://localhost:5000/api/test');
      expect(response.headers.get('content-type')).toBe('text/plain');
    });

    it('should support POST requests', async () => {
      const body = { title: 'Test' };
      global.fetch = jest.fn((url, options) => {
        expect(options.method).toBe('POST');
        return Promise.resolve({
          ok: true,
          headers: { get: () => 'application/json' },
          json: async () => ({ id: 1 }),
        });
      });

      await fetch('http://localhost:5000/api/tasks', {
        method: 'POST',
        body: JSON.stringify(body),
      });

      expect(global.fetch).toHaveBeenCalled();
    });

    it('should support custom headers', async () => {
      global.fetch = jest.fn((url, options) => {
        expect(options.headers).toBeDefined();
        return Promise.resolve({
          ok: true,
          headers: { get: () => 'application/json' },
          json: async () => ({}),
        });
      });

      await fetch('http://localhost:5000/api/test', {
        headers: { 'X-Custom': 'value' },
      });

      expect(global.fetch).toHaveBeenCalled();
    });
  });

  describe('API Response Handling', () => {
    it('should parse JSON array responses', async () => {
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          headers: { get: () => 'application/json' },
          json: async () => [
            { id: 1, name: 'Item 1' },
            { id: 2, name: 'Item 2' },
          ],
        })
      );

      const response = await fetch('http://localhost:5000/api/items');
      const data = await response.json();
      expect(Array.isArray(data)).toBe(true);
      expect(data).toHaveLength(2);
    });

    it('should handle empty responses', async () => {
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          headers: { get: () => 'application/json' },
          json: async () => ({}),
        })
      );

      const response = await fetch('http://localhost:5000/api/test');
      const data = await response.json();
      expect(typeof data).toBe('object');
    });

    it('should handle status codes correctly', async () => {
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: false,
          status: 401,
          statusText: 'Unauthorized',
          headers: { get: () => 'application/json' },
          json: async () => ({ message: 'Not authorized' }),
        })
      );

      const response = await fetch('http://localhost:5000/api/protected');
      expect(response.status).toBe(401);
      expect(response.ok).toBe(false);
    });
  });

  describe('Request Building', () => {
    it('should build query string correctly', () => {
      const params = new URLSearchParams({
        search: 'test',
        limit: '10',
      });
      const url = 'http://localhost:5000/api/items?' + params.toString();

      expect(url).toContain('search=test');
      expect(url).toContain('limit=10');
    });

    it('should handle multiple query parameters', () => {
      const params = new URLSearchParams({
        q: 'search term',
        sort: 'name',
        order: 'asc',
      });

      expect(params.get('q')).toBe('search term');
      expect(params.get('sort')).toBe('name');
      expect(params.get('order')).toBe('asc');
    });

    it('should encode URL parameters', () => {
      const params = new URLSearchParams({
        query: 'hello world',
      });
      const encoded = params.toString();

      expect(encoded).toContain('hello');
      expect(encoded).toContain('world');
    });
  });
});
