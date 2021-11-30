import { Request, Response, NextFunction } from "express";
import { isSessionValid } from "../services/session.service";
import logger from "../utils/logger";

const checkValidSession = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const userId =
            res && res.locals && res.locals.user && res.locals.user._id;

        if (!userId) {
            throw "Got no user id.";
        }

        let sessionValid = await isSessionValid(userId);

        if (!sessionValid) {
            return res
                .status(403)
                .send({ error: "This operation is forbidden." });
        }

        next();
    } catch (error) {
        logger.error(error);
        return res.status(400).send({ error });
    }
};

export default checkValidSession;
