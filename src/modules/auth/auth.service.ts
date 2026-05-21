import { pool } from "../../db";
import type { Iuser } from "./auth.interface";
import bcrypt from "bcrypt";

const signupUserIntoDB = async (payload: Iuser) => {
	const { name, email, password, role } = payload;

	const hashpassword = await bcrypt.hash(password, 12);

	const result = await pool.query(
		`INSERT INTO users(name,email,password,role)
                VALUES($1,$2,$3,$4)
                RETURNING *`,
		[name, email, hashpassword, role ?? "contributor"],
	);

	delete result.rows[0].password;

	return result;
};

export const authService = {
	signupUserIntoDB,
};
