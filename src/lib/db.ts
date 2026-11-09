import mysql from "mysql2/promise";

declare global {
  // eslint-disable-next-line no-var
  var _mysqlPool: mysql.Pool | undefined;
  // eslint-disable-next-line no-var
  var _tablesInitialized: boolean | undefined;
  // eslint-disable-next-line no-var
  var _tablesPromise: Promise<void> | undefined;
}

function parseConnectionConfig(): mysql.PoolOptions {
  const databaseUrl = process.env.DATABASE_URL?.trim();

  if (databaseUrl) {
    try {
      const parsed = new URL(databaseUrl);
      const isCloud = !["localhost", "127.0.0.1"].includes(parsed.hostname);

      return {
        host: parsed.hostname,
        port: parsed.port ? Number(parsed.port) : 3306,
        user: decodeURIComponent(parsed.username || "root"),
        password: decodeURIComponent(parsed.password || ""),
        database: parsed.pathname ? parsed.pathname.replace(/^\//, "") : "adpizzahub",
        waitForConnections: true,
        connectionLimit: 10,
        maxIdle: 2,
        idleTimeout: 30000,
        queueLimit: 0,
        enableKeepAlive: true,
        keepAliveInitialDelay: 0,
        ssl: isCloud ? { rejectUnauthorized: false } : undefined,
      };
    } catch {
      // Fallback to passing databaseUrl directly
      return {
        uri: databaseUrl,
        waitForConnections: true,
        connectionLimit: 10,
      };
    }
  }

  const host = process.env.MYSQL_HOST?.trim() || "localhost";
  const isCloud = host && !["localhost", "127.0.0.1"].includes(host);

  return {
    host,
    port: Number(process.env.MYSQL_PORT) || 3306,
    user: process.env.MYSQL_USER || "root",
    password: process.env.MYSQL_PASSWORD || "",
    database: process.env.MYSQL_DATABASE || "adpizzahub",
    waitForConnections: true,
    connectionLimit: 10,
    maxIdle: 2,
    idleTimeout: 30000,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
    ssl: isCloud ? { rejectUnauthorized: false } : undefined,
  };
}

export function getPool(): mysql.Pool {
  if (!global._mysqlPool) {
    global._mysqlPool = mysql.createPool(parseConnectionConfig());
  }
  return global._mysqlPool;
}

export async function ensureTables(): Promise<void> {
  if (global._tablesInitialized) return;

  if (!global._tablesPromise) {
    global._tablesPromise = (async () => {
      try {
        const p = getPool();

        await p.execute(`
          CREATE TABLE IF NOT EXISTS super_admins (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(100) NOT NULL UNIQUE,
            passwordHash VARCHAR(255) NOT NULL,
            name VARCHAR(150) NOT NULL,
            email VARCHAR(150) DEFAULT '',
            phone VARCHAR(50) DEFAULT '',
            role VARCHAR(50) DEFAULT 'superadmin',
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        `);

        await p.execute(`
          CREATE TABLE IF NOT EXISTS restaurants (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(150) NOT NULL,
            slug VARCHAR(100) NOT NULL UNIQUE,
            ownerName VARCHAR(150) DEFAULT '',
            phone VARCHAR(50) DEFAULT '',
            email VARCHAR(150) DEFAULT '',
            status ENUM('active', 'pending', 'inactive', 'suspended') DEFAULT 'pending',
            paymentStatus ENUM('paid', 'pending', 'failed') DEFAULT 'pending',
            paymentAmount DECIMAL(10,2) DEFAULT 0,
            paymentNotes TEXT,
            assignedTo INT NULL,
            assignedName VARCHAR(150) NULL,
            assignedRole VARCHAR(50) NULL,
            taskNotes TEXT,
            taskStatus ENUM('pending', 'in_progress', 'completed') DEFAULT 'pending',
            monthlyFee DECIMAL(10,2) DEFAULT 0,
            billingDueDate DATE NULL,
            subscriptionStatus ENUM('active', 'expired', 'suspended') DEFAULT 'active',
            lastPaymentDate DATE NULL,
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        `);

        await p.execute(`
          CREATE TABLE IF NOT EXISTS admins (
            id INT AUTO_INCREMENT PRIMARY KEY,
            restaurantId INT NOT NULL,
            username VARCHAR(100) NOT NULL,
            passwordHash VARCHAR(255) NOT NULL,
            role VARCHAR(50) DEFAULT 'admin',
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            UNIQUE KEY uq_admin_user (username)
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        `);

        await p.execute(`
          CREATE TABLE IF NOT EXISTS categories (
            id INT AUTO_INCREMENT PRIMARY KEY,
            restaurantId INT NOT NULL DEFAULT 1,
            name VARCHAR(150) NOT NULL,
            sortOrder INT DEFAULT 0,
            image TEXT,
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        `);

        await p.execute(`
          CREATE TABLE IF NOT EXISTS products (
            id INT AUTO_INCREMENT PRIMARY KEY,
            restaurantId INT NOT NULL DEFAULT 1,
            name VARCHAR(255) NOT NULL,
            description TEXT,
            price DECIMAL(10,2) NOT NULL DEFAULT 0,
            categoryId INT NULL,
            category VARCHAR(150) DEFAULT '',
            image TEXT,
            isVeg TINYINT(1) DEFAULT 1,
            variants JSON,
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        `);

        await p.execute(`
          CREATE TABLE IF NOT EXISTS orders (
            id INT AUTO_INCREMENT PRIMARY KEY,
            restaurantId INT NOT NULL DEFAULT 1,
            orderNumber VARCHAR(100) NOT NULL UNIQUE,
            customerName VARCHAR(150) NOT NULL,
            customerPhone VARCHAR(50) NOT NULL,
            customerAddress TEXT NOT NULL,
            items JSON NOT NULL,
            totalAmount DECIMAL(10,2) NOT NULL DEFAULT 0,
            status VARCHAR(50) DEFAULT 'pending',
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        `);

        await p.execute(`
          CREATE TABLE IF NOT EXISTS navbar_settings (
            id INT AUTO_INCREMENT PRIMARY KEY,
            restaurantId INT NOT NULL DEFAULT 1,
            setting_key VARCHAR(50) DEFAULT 'main',
            logoUrl TEXT,
            brand VARCHAR(150) DEFAULT '',
            tagline VARCHAR(255) DEFAULT '',
            phone VARCHAR(50) DEFAULT '',
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            UNIQUE KEY uq_nav_key_rest (restaurantId, setting_key)
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        `);

        await p.execute(`
          CREATE TABLE IF NOT EXISTS site_settings (
            id INT AUTO_INCREMENT PRIMARY KEY,
            restaurantId INT NOT NULL DEFAULT 1,
            setting_key VARCHAR(50) DEFAULT 'main',
            heroImages JSON,
            restaurantAddress TEXT,
            restaurantInstruction TEXT,
            restaurantPhone VARCHAR(50) DEFAULT '',
            paymentQrImage TEXT,
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            UNIQUE KEY uq_site_key_rest (restaurantId, setting_key)
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        `);

        await p.execute(`
          CREATE TABLE IF NOT EXISTS file_uploads (
            id INT AUTO_INCREMENT PRIMARY KEY,
            filename VARCHAR(255) NOT NULL,
            mimetype VARCHAR(100) NOT NULL,
            data LONGBLOB NOT NULL,
            size INT NOT NULL,
            uploadedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        `);

        global._tablesInitialized = true;
      } catch (err) {
        console.error("Auto table creation warning:", err);
      }
    })();
  }

  return global._tablesPromise;
}

export function isDbConfigured(): boolean {
  return Boolean(
    process.env.DATABASE_URL ||
    process.env.MYSQL_DATABASE ||
    process.env.MYSQL_HOST
  );
}

export const isMongoConfigured = isDbConfigured;

export async function connectDB(): Promise<mysql.Pool> {
  const p = getPool();
  await ensureTables();
  return p;
}

export function isValidId(id: unknown): boolean {
  if (id === null || id === undefined) return false;
  const s = String(id).trim();
  return /^\d+$/.test(s) && Number(s) > 0;
}

export async function query<T = any>(sql: string, values?: any[]): Promise<T> {
  await ensureTables();
  const p = getPool();
  const [rows] = await p.query(sql, values);
  return rows as T;
}

export async function execute<T = any>(sql: string, values?: any[]): Promise<T> {
  await ensureTables();
  const p = getPool();
  const [result] = await p.execute(sql, values);
  return result as T;
}
