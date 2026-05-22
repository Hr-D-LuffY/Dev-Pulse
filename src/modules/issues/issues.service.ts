import { pool } from "../../db";

const createIssueIntoDB = async (body: {
	title: string;
	description: string;
	type: string;
	reporter_id: number;
}) => {
	const { title, description, type, reporter_id } = body;

	const result = await pool.query(
		`INSERT INTO issues (title, description, type, reporter_id)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
		[title, description, type, reporter_id],
	);

	return result.rows[0];
};

const getAllIssuesFromDB = async (filters: {
	type?: string;
	status?: string;
	sort?: string;
}) => {
	const { type, status, sort } = filters;

	const conditions: string[] = [];
	const values: any[] = [];

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

	const issue = issueResult.rows.length;
	if (issue <= 0) throw new Error("Issue not found");

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

const formatIssueWithReporter = async (issue: any) => {
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

// const updateUserFromDB = async (payload: IUser, id: string) => {
// 	const { name, password, age, is_active } = payload;

// 	const result = await pool.query(
// 		`
//     UPDATE users
//     SET
//     name=COALESCE($1,name),
//     password=COALESCE($2,password),
//     age=COALESCE($3,age),
//     is_active=COALESCE($4,is_active)

//     WHERE id=$5 RETURNING *
//     `,
// 		[name, password, age, is_active, id],
// 	);

// 	return result;
// };

export const issueService = {
	createIssueIntoDB,
	getAllIssuesFromDB,
	getSingleIssueFromDB,
	// updateUserFromDB,
	deleteIssueFromDB,
};
