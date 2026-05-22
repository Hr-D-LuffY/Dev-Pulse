import { Router } from "express";
import { issuesController } from "./issues.controller";
import { USER_ROLE } from "../../types";
import { authenticate, authorize } from "../../middleware/auth";

const router = Router();

router.post(
	"/",
	authenticate,
	authorize(USER_ROLE.contributor, USER_ROLE.maintainer),
	issuesController.createIssue,
);
router.get("/", issuesController.getAllIssue);
router.get("/:id", issuesController.getSingleIssue);
router.patch(
	"/:id",
	authenticate,
	authorize("contributor", "maintainer"),
	issuesController.updateIssue,
);
router.delete(
	"/:id",
	authenticate,
	authorize(USER_ROLE.maintainer),
	issuesController.deleteIssue,
);

export const issuesRoute = router;
