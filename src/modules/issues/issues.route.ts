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
// router.get("/", issuesController.jid);?sort=newest
router.get("/:id", issuesController.getSingleIssue);
// router.patch("/:id", issuesController.jid);
// router.delete("/:id", issuesController.jid);

export const issuesRoute = router;
