import type { Request, Response } from "express";
import sendResponse from "../../utility/sendresponse";
import { issueService } from "./issues.service";

const createIssue = async (req: Request, res: Response) => {
	console.log(req.user!.id);
	try {
		const reporter_id = req.user!.id;

		const result = await issueService.createIssueIntoDB({
			...req.body,
			reporter_id,
		});

		sendResponse(res, {
			statusCode: 201,
			success: true,
			message: "Issue created successfully",
			data: result,
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

export const issuesController = {
	createIssue,
};
