import config from "../../config";
import { pool } from "../../db";
import type { Iuser, IuserLogin } from "./auth.interface";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const signupUserIntoDB = async (payload: Iuser) => {
	const { name, email, password, role } = payload;

	const hashpassword = await bcrypt.hash(password, 12);

	const result = await pool.query(
		`INSERT INTO users(name,email,password,role)
                VALUES($1,$2,$3,$4)
                RETURNING *`,
		[name, email, hashpassword, role ?? "contributor"],
	);

	const { password: _, ...safeUser } = result.rows[0];
	return safeUser;
};

const loginUserIntoDB = async (payload: IuserLogin) => {
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

	const jwtpayload = {
		id: user.id,
		name: user.name,
		role: user.role,
		email: user.email,
	};

	const accessToken = jwt.sign(jwtpayload, config.secret as string, {
		expiresIn: "1d",
	});

	const { password: _, ...safeUser } = user;
	return { token: accessToken, user: safeUser };
};

export const authService = {
	signupUserIntoDB,
	loginUserIntoDB,
};
