import mongoose from "mongoose";
import config from "config";
import logger from "./logger";

async function connect() {
    const dbUri = config.get<string>("dbUri");

    try {
        mongoose.Promise = global.Promise;

        await mongoose.connect(dbUri);
        const db = mongoose.connection;

        // Bind connection to error event (to get notification of connection errors)
        db.on(
            "error",
            console.error.bind(console, "MongoDB connection error:")
        );
        logger.info("Connected to DB.");
    } catch (error) {
        logger.error("Could not connect to DB.");
        console.error(error);
        process.exit(1);
    }
}

export default connect;
