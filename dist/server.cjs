

   import { createRequire } from 'module';

   const require = createRequire(import.meta.url);

  
"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// src/server.ts
var import_express3 = __toESM(require("express"), 1);

// src/config/index.ts
var import_dotenv = __toESM(require("dotenv"), 1);
var import_path = __toESM(require("path"), 1);
import_dotenv.default.config({
  path: import_path.default.join(process.cwd(), ".env")
});
var config = {
  connection_string: process.env.CONNECTION_STRING,
  port: process.env.PORT,
  secret: process.env.JWT_SECRET
};
var config_default = config;

// src/db/index.ts
var import_pg = require("pg");
var pool = new import_pg.Pool({
  connectionString: config_default.connection_string
});
var initDB = async () => {
  try {
    await pool.query(`
      DO $$ BEGIN
        CREATE TYPE roles_type AS ENUM ('contributor', 'maintainer');
      EXCEPTION WHEN duplicate_object THEN
        RAISE NOTICE 'roles_type already exists, skipping';
      END $$;

      DO $$ BEGIN
        CREATE TYPE issue_type AS ENUM ('bug', 'feature_request');
      EXCEPTION WHEN duplicate_object THEN
        RAISE NOTICE 'issue_type already exists, skipping';
      END $$;

      DO $$ BEGIN
        CREATE TYPE issue_status AS ENUM ('open', 'in_progress', 'resolved');
      EXCEPTION WHEN duplicate_object THEN
        RAISE NOTICE 'issue_status already exists, skipping';
      END $$;
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id          SERIAL       PRIMARY KEY,
        name        VARCHAR(50) NOT NULL,
        email       VARCHAR(150) UNIQUE NOT NULL,
        password    TEXT         NOT NULL,
        role        roles_type   DEFAULT 'contributor',
        created_at  TIMESTAMP    DEFAULT NOW(),
        updated_at  TIMESTAMP    DEFAULT NOW()
      )
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS issues (
        id           SERIAL       PRIMARY KEY,
        title        VARCHAR(150) NOT NULL,
        description  TEXT         NOT NULL CHECK (char_length(description) >= 20),
        type         issue_type   NOT NULL,
        status       issue_status NOT NULL DEFAULT 'open',
        reporter_id INTEGER NOT NULL,
        created_at   TIMESTAMP    DEFAULT NOW(),
        updated_at   TIMESTAMP    DEFAULT NOW()
      )
    `);
    console.log("Database initialized successfully!");
  } catch (error) {
    console.error("Database initialization failed:", error);
    process.exit(1);
  }
};

// src/modules/auth/auth.route.ts
var import_express = require("express");

// src/utility/sendresponse.ts
var sendResponse = (res, data) => {
  res.status(data.statusCode).json({
    success: data.success,
    message: data.message,
    data: data.data,
    error: data.error
  });
};
var sendresponse_default = sendResponse;

// src/modules/auth/auth.service.ts
var import_bcrypt = __toESM(require("bcrypt"), 1);
var import_jsonwebtoken = __toESM(require("jsonwebtoken"), 1);
var signupUserIntoDB = async (payload) => {
  const { name, email, password, role } = payload;
  const hashpassword = await import_bcrypt.default.hash(password, 12);
  const result = await pool.query(
    `INSERT INTO users(name,email,password,role)
                VALUES($1,$2,$3,$4)
                RETURNING *`,
    [name, email, hashpassword, role ?? "contributor"]
  );
  const { password: _, ...safeUser } = result.rows[0];
  return safeUser;
};
var loginUserIntoDB = async (payload) => {
  const { email, password } = payload;
  const userData = await pool.query(
    `
    SELECT * FROM users WHERE email=$1
    `,
    [email]
  );
  if (userData.rows.length === 0) {
    throw new Error("Invalid Credentials !!!");
  }
  const user = userData.rows[0];
  const matchPassword = await import_bcrypt.default.compare(password, user.password);
  if (!matchPassword) {
    throw new Error("Invalid Credentials!");
  }
  const jwtpayload = {
    id: user.id,
    name: user.name,
    role: user.role,
    email: user.email
  };
  const accessToken = import_jsonwebtoken.default.sign(jwtpayload, config_default.secret, {
    expiresIn: "1d"
  });
  const { password: _, ...safeUser } = user;
  return { token: accessToken, user: safeUser };
};
var authService = {
  signupUserIntoDB,
  loginUserIntoDB
};

// src/modules/auth/auth.controller.ts
var signup = async (req, res) => {
  try {
    const result = await authService.signupUserIntoDB(req.body);
    sendresponse_default(res, {
      statusCode: 201,
      success: true,
      message: "User Registered Successfully!",
      data: result
    });
  } catch (error) {
    sendresponse_default(res, {
      statusCode: 500,
      success: false,
      message: error.message,
      error
    });
  }
};
var login = async (req, res) => {
  try {
    const { token, user } = await authService.loginUserIntoDB(req.body);
    sendresponse_default(res, {
      statusCode: 200,
      success: true,
      message: "Login successful",
      data: {
        token,
        user
      }
    });
  } catch (error) {
    sendresponse_default(res, {
      statusCode: 500,
      success: false,
      message: error.message,
      error
    });
  }
};
var authController = {
  signup,
  login
};

// src/modules/auth/auth.route.ts
var router = (0, import_express.Router)();
router.post("/signup", authController.signup);
router.post("/login", authController.login);
var authRoute = router;

// src/modules/issues/issues.route.ts
var import_express2 = require("express");

// src/modules/issues/issues.service.ts
var createIssueIntoDB = async (body) => {
  const { title, description, type, reporter_id } = body;
  const result = await pool.query(
    `INSERT INTO issues (title, description, type, reporter_id)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [title, description, type, reporter_id]
  );
  return result.rows[0];
};
var getAllIssuesFromDB = async (filters) => {
  const { type, status, sort } = filters;
  const conditions = [];
  const values = [];
  if (type) {
    conditions.push(`type = $${values.length + 1}`);
    values.push(type);
  }
  if (status) {
    conditions.push(`status = $${values.length + 1}`);
    values.push(status);
  }
  const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  const orderBy = sort === "oldest" ? "ORDER BY created_at ASC" : "ORDER BY created_at DESC";
  const issueResult = await pool.query(
    `SELECT * FROM issues ${where} ${orderBy}`,
    values
  );
  return await Promise.all(
    issueResult.rows.map((issue) => formatIssueWithReporter(issue))
  );
};
var getSingleIssueFromDB = async (id) => {
  const issueResult = await pool.query(
    `
        SELECT * FROM issues WHERE id = $1`,
    [id]
  );
  const issue = issueResult.rows[0];
  if (!issue) throw new Error("Issue not found");
  return await formatIssueWithReporter(issue);
};
var formatIssueWithReporter = async (issue) => {
  const userResult = await pool.query(
    `SELECT id, name, role FROM users WHERE id = $1`,
    [issue.reporter_id]
  );
  const reporter = userResult.rows[0];
  const { reporter_id: _, created_at, updated_at, ...rest } = issue;
  return {
    ...rest,
    reporter: {
      id: reporter.id,
      name: reporter.name,
      role: reporter.role
    },
    created_at,
    updated_at
  };
};
var deleteIssueFromDB = async (id) => {
  const result = await pool.query(
    `
    DELETE FROM issues WHERE id=$1
      `,
    [id]
  );
  return result;
};
var updateIssueIntoDB = async (issueId, payload) => {
  const { title, description, type } = payload;
  const updateResult = await pool.query(
    `UPDATE issues SET
      title       = COALESCE($1, title),
      description = COALESCE($2, description),
      type        = COALESCE($3, type),
      updated_at  = NOW()
     WHERE id = $4
     RETURNING *`,
    [title, description, type, issueId]
  );
  if (!updateResult.rows[0]) throw new Error("Issue not found");
  return updateResult.rows[0];
};
var issueService = {
  createIssueIntoDB,
  getAllIssuesFromDB,
  getSingleIssueFromDB,
  updateIssueIntoDB,
  deleteIssueFromDB
};

// src/modules/issues/issues.controller.ts
var createIssue = async (req, res) => {
  try {
    const reporter_id = req.user.id;
    const result = await issueService.createIssueIntoDB({
      ...req.body,
      reporter_id
    });
    sendresponse_default(res, {
      statusCode: 201,
      success: true,
      message: "Issue created successfully",
      data: result
    });
  } catch (error) {
    sendresponse_default(res, {
      statusCode: 500,
      success: false,
      message: error.message,
      error
    });
  }
};
var getAllIssue = async (req, res) => {
  const { type, status, sort } = req.query;
  try {
    const result = await issueService.getAllIssuesFromDB({
      type,
      status,
      sort
    });
    sendresponse_default(res, {
      statusCode: 200,
      success: true,
      message: "Issue Fetched Successfully!",
      data: result
    });
  } catch (error) {
    sendresponse_default(res, {
      statusCode: 500,
      success: false,
      message: error.message,
      error
    });
  }
};
var getSingleIssue = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await issueService.getSingleIssueFromDB(id);
    sendresponse_default(res, {
      statusCode: 200,
      success: true,
      message: "Issue Fetched Successfully!",
      data: result
    });
  } catch (error) {
    sendresponse_default(res, {
      statusCode: 500,
      success: false,
      message: error.message,
      error
    });
  }
};
var updateIssue = async (req, res) => {
  try {
    const issueId = req.params.id;
    const userId = req.user.id;
    const role = req.user.role;
    if (role === "contributor") {
      const issue = await issueService.getSingleIssueFromDB(issueId);
      if (issue.reporter.id !== userId) {
        return sendresponse_default(res, {
          statusCode: 403,
          success: false,
          message: "You can only update your own issues"
        });
      }
      if (issue.status !== "open") {
        return sendresponse_default(res, {
          statusCode: 403,
          success: false,
          message: "Contributors can only update issues with open status"
        });
      }
    }
    const result = await issueService.updateIssueIntoDB(
      issueId,
      req.body
    );
    sendresponse_default(res, {
      statusCode: 200,
      success: true,
      message: "Issue updated successfully",
      data: result
    });
  } catch (error) {
    sendresponse_default(res, {
      statusCode: 500,
      success: false,
      message: error.message,
      error
    });
  }
};
var deleteIssue = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await issueService.deleteIssueFromDB(id);
    if (result.rowCount === 0) {
      return sendresponse_default(res, {
        statusCode: 404,
        success: false,
        message: "Issue not found"
      });
    }
    sendresponse_default(res, {
      statusCode: 200,
      success: true,
      message: "Issue deleted successfully"
    });
  } catch (error) {
    sendresponse_default(res, {
      statusCode: 500,
      success: false,
      message: error.message,
      error
    });
  }
};
var issuesController = {
  createIssue,
  getAllIssue,
  getSingleIssue,
  updateIssue,
  deleteIssue
};

// src/types/index.ts
var USER_ROLE = {
  contributor: "contributor",
  maintainer: "maintainer"
};

// src/middleware/auth.ts
var import_jsonwebtoken2 = __toESM(require("jsonwebtoken"), 1);
var authenticate = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ success: false, message: "No token provided" });
  }
  try {
    const decoded = import_jsonwebtoken2.default.verify(token, config_default.secret);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};
var authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }
    next();
  };
};

// src/modules/issues/issues.route.ts
var router2 = (0, import_express2.Router)();
router2.post(
  "/",
  authenticate,
  authorize(USER_ROLE.contributor, USER_ROLE.maintainer),
  issuesController.createIssue
);
router2.get("/", issuesController.getAllIssue);
router2.get("/:id", issuesController.getSingleIssue);
router2.patch(
  "/:id",
  authenticate,
  authorize("contributor", "maintainer"),
  issuesController.updateIssue
);
router2.delete(
  "/:id",
  authenticate,
  authorize(USER_ROLE.maintainer),
  issuesController.deleteIssue
);
var issuesRoute = router2;

// src/server.ts
var app = (0, import_express3.default)();
var port = config_default.port;
app.use(import_express3.default.json());
app.use(import_express3.default.text());
app.use(import_express3.default.urlencoded({ extended: true }));
app.get("/", (req, res) => {
  res.status(200).json({
    message: "Express Server",
    project: "Dev Pulse"
  });
});
app.use("/api/auth", authRoute);
app.use("/api/issues", issuesRoute);
initDB();
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
//# sourceMappingURL=server.cjs.map