import express, {
	type Application,
	type Request,
	type Response,
} from "express";
import config from "./config";
import { initDB } from "./db";
import { authRoute } from "./modules/auth/auth.route";
import { issuesRoute } from "./modules/issues/issues.route";

const app: Application = express();
const port = config.port;

app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req: Request, res: Response) => {
	res.status(200).json({
		message: "Express Server",
		project: "Dev Pulse",
	});
});

app.use('/api/auth', authRoute )
app.use('/api/issues', issuesRoute )

initDB();
app.listen(port, () => {
	console.log(`Example app listening on port ${port}`);
});
