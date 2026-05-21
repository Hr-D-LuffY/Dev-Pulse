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

const loginUserIntoDB = async (payload: {
	email: string;
	password: string;
}) => {
	const { email, password } = payload;

	const userData = await pool.query(
		`
    SELECT * FROM users WHERE email=$1
    `,
		[email],
	);
	if (userData.rows.length === 0) {
		throw new Error("Invalid Credentials !!!");
	}

	const user = userData.rows[0];
	const matchPassword = await bcrypt.compare(password, user.password);
	if (!matchPassword) {
		throw new Error("Invalid Credentials!");
	}

	const token = "dfdsfa";
	delete userData.rows[0].password;
	return { token, user: userData.rows[0] };
};

export const authService = {
	signupUserIntoDB,
	loginUserIntoDB,
};
