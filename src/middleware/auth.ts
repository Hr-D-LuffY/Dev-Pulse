import type { NextFunction, Request, Response } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import config from "../config";
import type { ROLES } from "../types";
import { pool } from "../db";

export const authenticate = (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	const token = req.headers.authorization;

	if (!token) {
		return res
			.status(401)
			.json({ success: false, message: "No token provided" });
	}

	try {
		const decoded = jwt.verify(token, config.secret as string) as {
			id: number;
			role: string;
		};
		req.user = decoded;
		next();
	} catch (error) {
		return res
			.status(401)
			.json({ success: false, message: "Invalid or expired token" });
	}
};

export const authorize = (...roles: string[]) => {
	return (req: Request, res: Response, next: NextFunction) => {
		if (!req.user || !roles.includes(req.user.role)) {
			return res.status(403).json({ success: false, message: "Access denied" });
		}
		next();
	};
};
