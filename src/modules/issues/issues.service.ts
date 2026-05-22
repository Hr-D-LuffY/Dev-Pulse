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

// const getAllUsersFromDB = async () => {
// 	const result = await pool.query(`
//       SELECT * FROM users
//         `);
// 	return result;
// };

// const getSingleUserFromDB = async (id: string) => {
// 	const result = await pool.query(
// 		`
//       SELECT * FROM users WHERE id=$1
//         `,
// 		[id],
// 	);
// 	return result;
// };

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

// const deleteUserFromDB = async (id: string) => {
// 	const result = await pool.query(
// 		`
//     DELETE FROM users WHERE id=$1
//       `,
// 		[id],
// 	);
// 	return result;
// };

export const issueService = {
	createIssueIntoDB,
	// getAllUsersFromDB,
	// getSingleUserFromDB,
	// updateUserFromDB,
	// deleteUserFromDB,
};
