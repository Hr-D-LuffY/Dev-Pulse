import { pool } from "../../db";
import type { ICreateIssue, IIssueFilters, IIssueRow, IUpdateIssue } from "./issues.iterface";

const createIssueIntoDB = async (body: ICreateIssue) => {
	const { title, description, type, reporter_id } = body;

	const result = await pool.query(
		`INSERT INTO issues (title, description, type, reporter_id)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
		[title, description, type, reporter_id],
	);

	return result.rows[0];
};

const getAllIssuesFromDB = async (filters: IIssueFilters ) => {
	const { type, status, sort } = filters;

	const conditions: string[] = [];
	const values: string[] = [];

	if (type) {
		conditions.push(`type = $${values.length + 1}`);
		values.push(type);
	}

	if (status) {
		conditions.push(`status = $${values.length + 1}`);
		values.push(status);
	}

	const where =
		conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
	const orderBy =
		sort === "oldest" ? "ORDER BY created_at ASC" : "ORDER BY created_at DESC";

	const issueResult = await pool.query(
		`SELECT * FROM issues ${where} ${orderBy}`,
		values,
	);

	return await Promise.all(
		issueResult.rows.map((issue) => formatIssueWithReporter(issue)),
	);
};

const getSingleIssueFromDB = async (id: string) => {
	const issueResult = await pool.query(
		`
        SELECT * FROM issues WHERE id = $1`,
		[id],
	);
	const issue = issueResult.rows[0];

	if (!issue) throw new Error("Issue not found");

	return await formatIssueWithReporter(issue);
};

const formatIssueWithReporter = async (issue: IIssueRow) => {
	const userResult = await pool.query(
		`SELECT id, name, role FROM users WHERE id = $1`,
		[issue.reporter_id],
	);

	const reporter = userResult.rows[0];
	const { reporter_id: _, created_at, updated_at, ...rest } = issue;

	return {
		...rest,
		reporter: {
			id: reporter.id,
			name: reporter.name,
			role: reporter.role,
		},
		created_at,
		updated_at,
	};
};

const deleteIssueFromDB = async (id: string) => {
	const result = await pool.query(
		`
    DELETE FROM issues WHERE id=$1
      `,
		[id],
	);
	return result;
};

const updateIssueIntoDB = async (issueId: string, payload: IUpdateIssue) => {
	const { title, description, type } = payload;
	const updateResult = await pool.query(
		`UPDATE issues SET
      title       = COALESCE($1, title),
      description = COALESCE($2, description),
      type        = COALESCE($3, type),
      updated_at  = NOW()
     WHERE id = $4
     RETURNING *`,
		[title, description, type, issueId],
	);

	if (!updateResult.rows[0]) throw new Error("Issue not found");

	return updateResult.rows[0];
};

export const issueService = {
	createIssueIntoDB,
	getAllIssuesFromDB,
	getSingleIssueFromDB,
	updateIssueIntoDB,
	deleteIssueFromDB,
};
