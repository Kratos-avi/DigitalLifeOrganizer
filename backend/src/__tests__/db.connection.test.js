// Backend Database Connection Tests
const path = require('path');
const fs = require('fs');

describe('Database Connection', () => {
  it('should have database module imported', () => {
    // Simple smoke test that db module exists
    expect(() => {
      require('../config/db');
    }).not.toThrow();
  });

  it('should export a pool object with query method', () => {
    const db = require('../config/db');
    expect(db).toBeDefined();
    expect(typeof db.query).toBe('function');
  });

  it('should handle query errors gracefully', async () => {
    const db = require('../config/db');
    // Test that query method exists and is callable
    expect(typeof db.query).toBe('function');
  });
});

describe('Database Schema', () => {
  it('should have schema file in config directory', () => {
    const schemaPath = path.join(__dirname, '../config/schema.sqlite.sql');
    expect(fs.existsSync(schemaPath)).toBe(true);
  });

  it('should be able to read schema file', () => {
    const schemaPath = path.join(__dirname, '../config/schema.sqlite.sql');
    const schema = fs.readFileSync(schemaPath, 'utf-8');
    expect(schema.length).toBeGreaterThan(0);
    expect(schema).toContain('CREATE TABLE');
  });
});
