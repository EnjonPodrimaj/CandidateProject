import { Request, Response } from "express";
import { CreateUserInput } from "../schemas/user.schema";
import { createUser } from "../services/user.service";
import { omit } from "lodash";
import logger from "../utils/logger";

export async function userCreationHandler(
    req: Request<{}, {}, CreateUserInput["body"]>,
    res: Response
) {
    try {
        const user = await createUser(req.body);
        return res.send(omit(user, "password"));
    } catch (err: any) {
        logger.error(err);
        return res.status(409).send(err.message);
    }
}
