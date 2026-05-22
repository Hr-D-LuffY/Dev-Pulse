import type { Request, Response } from "express";
import sendResponse from "../../utility/sendresponse";
import { issueService } from "./issues.service";

const createIssue = async (req: Request, res: Response) => {
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

const getAllIssue = async (req: Request, res: Response) => {
	const { type, status, sort } = req.query;
	try {
		const result = await issueService.getAllIssuesFromDB({
			type: type as string,
			status: status as string,
			sort: sort as string,
		});

		sendResponse(res, {
			statusCode: 200,
			success: true,
			message: "Issue Fetched Successfully!",
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

const getSingleIssue = async (req: Request, res: Response) => {
	const { id } = req.params;
	try {
		const result = await issueService.getSingleIssueFromDB(id as string);

		// console.log(result.rows[0].reporter_id);
		sendResponse(res, {
			statusCode: 200,
			success: true,
			message: "Issue Fetched Successfully!",
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

const updateIssue = async (req: Request, res: Response) => {
	try {
		const issueId = req.params.id;
		const userId = req.user!.id;
		const role = req.user!.role;

		if (role === "contributor") {
			const issue = await issueService.getSingleIssueFromDB(issueId as string);

			if (issue.reporter.id !== userId) {
				return sendResponse(res, {
					statusCode: 403,
					success: false,
					message: "You can only update your own issues",
				});
			}
			if (issue.status !== "open") {
				return sendResponse(res, {
					statusCode: 403,
					success: false,
					message: "Contributors can only update issues with open status",
				});
			}
		}

		const result = await issueService.updateIssueIntoDB(
			issueId as string,
			req.body,
		);

		sendResponse(res, {
			statusCode: 200,
			success: true,
			message: "Issue updated successfully",
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

const deleteIssue = async (req: Request, res: Response) => {
	const { id } = req.params;

	try {
		const result = await issueService.deleteIssueFromDB(id as string);

		if (result.rowCount === 0) {
			return sendResponse(res, {
				statusCode: 404,
				success: false,
				message: "Issue not found",
			});
		}
		sendResponse(res, {
			statusCode: 200,
			success: true,
			message: "Issue deleted successfully",
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
	getAllIssue,
	getSingleIssue,
	updateIssue,
	deleteIssue,
};
