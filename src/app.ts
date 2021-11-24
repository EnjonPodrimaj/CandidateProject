import express from "express";
import config from "config";
import connect from "./utils/connect";
import logger from "./utils/logger";
import routes from "./routes";
const port = config.get<string>("port");

process.on("unhandledRejection", (reason, promise) => {
    console.error("Unhandled Rejection at:", promise, "Reason:", reason);
    process.exit(1);
});

const app = express();

app.use(express.json());

app.listen(port, async () => {
    logger.info(`App is running at https://localhost:${port}`);

    await connect();

    routes(app);
});
