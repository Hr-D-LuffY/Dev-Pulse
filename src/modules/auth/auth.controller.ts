import type { Request, Response } from "express";
import sendResponse from "../../utility/sendresponse";
import { authService } from "./auth.service";

const signup = async (req: Request, res: Response) => {
	try {
		const result = await authService.signupUserIntoDB(req.body);
		sendResponse(res, {
			statusCode: 201,
			success: true,
			message: "User Registered Successfully!",
			data: result.rows[0],
		});
	} catch (error: any) {
		sendResponse(res, {
			statusCode: 500,
			success: false,
			message: error.message,
			error: error,
		});
	}
};

const login = async (req: Request, res: Response) => {
	try {
		const { token, user } = await authService.loginUserIntoDB(req.body);
		sendResponse(res, {
			statusCode: 201,
			success: true,
			message: "Login successful",
			data: {
				token,
				user,
			},
		});
	} catch (error: any) {
		sendResponse(res, {
			statusCode: 500,
			success: false,
			message: error.message,
			error: error,
		});
	}
};

export const authController = {
	signup,
	login,
};
