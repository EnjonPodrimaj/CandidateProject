import config from "config";
import connect from "./utils/connect";
import logger from "./utils/logger";
import createServer from "./utils/server";

const port = config.get<string>("port");

process.on("unhandledRejection", (reason, promise) => {
    console.error("Unhandled Rejection at:", promise, "Reason:", reason);
    process.exit(1);
});

const app = createServer();

app.listen(port, async () => {
    logger.info(`App is running at https://localhost:${port}`);

    await connect();
});
