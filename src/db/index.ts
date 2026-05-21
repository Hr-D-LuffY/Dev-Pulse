import { Pool } from "pg";
import config from "../config";

export const pool = new Pool({
	connectionString: config.connection_string,
});

export const initDB = async () => {
	try {
		await pool.query(`
        DROP TABLE IF EXISTS issues;
        DROP TABLE IF EXISTS users;

        DROP TYPE IF EXISTS roles_type;
        DROP TYPE IF EXISTS issue_type;
        DROP TYPE IF EXISTS issue_status;

        CREATE TYPE roles_type AS ENUM ('contributor', 'maintainer');
        CREATE TYPE issue_type AS ENUM ('bug', 'feature_request');
        CREATE TYPE issue_status AS ENUM ('open', 'in_progress', 'resolved');
`);

		await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id          SERIAL        PRIMARY KEY,
        name        VARCHAR(50),
        email       VARCHAR(50)  UNIQUE NOT NULL,
        password    TEXT          NOT NULL,
        role        roles_type    DEFAULT 'contributor',
        created_at  TIMESTAMP     DEFAULT NOW(),
        updated_at  TIMESTAMP     DEFAULT NOW()
      )
    `);

		await pool.query(`
      CREATE TABLE IF NOT EXISTS issues (
        id           SERIAL        PRIMARY KEY,
        title        VARCHAR(150)  NOT NULL,
        description  TEXT          NOT NULL CHECK (char_length(description) >= 20),
        type         issue_type    NOT NULL,
        status       issue_status  NOT NULL DEFAULT 'open',
        reporter_id  INTEGER       NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at   TIMESTAMP     DEFAULT NOW(),
        updated_at   TIMESTAMP     DEFAULT NOW()
      )
    `);

		console.log("Database initialized successfully!");
	} catch (error) {
		console.error("Database initialization failed:", error);
		process.exit(1);
	}
};
