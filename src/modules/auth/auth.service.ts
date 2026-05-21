import { pool } from "../../db";
import type { Iuser } from "./auth.interface";

const signupUserIntoDB = async (payload: Iuser) => {
	const { name, email, password, role } = payload;
	const result = await pool.query(
		`INSERT INTO users(name,email,password,role)
                VALUES($1,$2,$3,$4)
                RETURNING *`,
		[name, email, password, role ?? "contributor"],
	);

	delete result.rows[0].password;

	return result;
};

export const authService = {
	signupUserIntoDB,
};
