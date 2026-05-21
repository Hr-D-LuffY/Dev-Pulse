import express, {
	type Application,
	type Request,
	type Response,
} from "express";
import config from "./config";
import { initDB } from "./db";

const app: Application = express();
const port = config.port;

app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req: Request, res: Response) => {
	res.send("Hello World!");
});

initDB();
app.listen(port, () => {
	console.log(`Example app listening on port ${port}`);
});
