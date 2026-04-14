const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");

const schemaFile = path.join(__dirname, "schema.mysql.sql");

function parseMySqlUrl(connectionString) {
  const u = new URL(connectionString);
  return {
    host: u.hostname,
    port: Number(u.port || 3306),
    user: decodeURIComponent(u.username || ""),
    password: decodeURIComponent(u.password || ""),
    database: (u.pathname || "").replace(/^\//, "") || undefined,
  };
}

const mysqlUrl =
  process.env.MYSQL_URL || process.env.MYSQL_PUBLIC_URL || process.env.DATABASE_URL;

const baseConfig = mysqlUrl
  ? parseMySqlUrl(mysqlUrl)
  : {
      host: process.env.DB_HOST || process.env.MYSQLHOST || "127.0.0.1",
      port: Number(process.env.DB_PORT || process.env.MYSQLPORT || 3306),
      user: process.env.DB_USER || process.env.MYSQLUSER || "root",
      password: process.env.DB_PASSWORD || process.env.MYSQLPASSWORD || "",
      database:
        process.env.DB_NAME ||
        process.env.MYSQLDATABASE ||
        process.env.MYSQL_DATABASE ||
        "digital_life_organizer",
    };

const pool = mysql.createPool({
  ...baseConfig,
  waitForConnections: true,
  connectionLimit: Number(process.env.DB_CONNECTION_LIMIT || 10),
  queueLimit: 0,
});

let initPromise;

async function initializeSchema() {
  if (initPromise) return initPromise;

  initPromise = (async () => {
    const schemaSql = fs.readFileSync(schemaFile, "utf8");
    const statements = schemaSql
      .split(/;\s*(?:\r?\n|$)/)
      .map((s) => s.trim())
      .filter(Boolean);

    for (const statement of statements) {
      await pool.query(statement);
    }
  })().catch((err) => {
    console.error("Database initialization failed:", err.message);
    throw err;
  });

  return initPromise;
}

async function query(sql, params = []) {
  await initializeSchema();
  return pool.query(sql, params);
}

module.exports = { query, pool, initializeSchema };
