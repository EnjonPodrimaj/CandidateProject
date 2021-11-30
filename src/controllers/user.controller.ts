import { NextFunction, Request, Response } from "express";
import { CreateUserInput } from "../schemas/user.schema";
import {
    createUser,
    getMostLiked,
    getUsernameAndLikeCountFunctionality,
    likeUserFunctionality,
    unlikeUserFunctionality,
    updateUserFunctionality,
} from "../services/user.service";
import { deleteSessionHandler } from "./session.controller";
import { omit } from "lodash";
import logger from "../utils/logger";

export async function userCreationHandler(
    req: Request<{}, {}, CreateUserInput["body"]>,
    res: Response
) {
    try {
        const user = await createUser(req.body);
        return res.send(omit(user, "password", "liked_from", "__v"));
    } catch (error: any) {
        logger.error(error);
        return res.status(400).send({ error: error, message: error.message });
    }
}

export async function getUserData(_: Request, res: Response) {
    try {
        const user = res.locals.user;

        if (!user)
            return res.status(500).send({ error: "Could not get user." });

        return res.send(user);
    } catch (error: any) {
        logger.error(error);
        return res.status(409).send({ error });
    }
}

export async function updateUser(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const { oldToBePassword, newPassword, newPasswordConfirmation } =
            req.body;
        let { email, _id: id } = res.locals.user;

        let response = await updateUserFunctionality(
            id,
            email,
            oldToBePassword,
            newPassword,
            newPasswordConfirmation
        );

        await deleteSessionHandler(req, res);

        return res.send(response);
    } catch (error) {
        logger.error(error);
        return res.status(500).send({ error });
    }
}

export async function getTheMostFamousOne(_: Request, res: Response) {
    try {
        const mostLiked = await getMostLiked();
        return res.send(mostLiked);
    } catch (error) {
        logger.error(error);
        return res.status(400).send({ error });
    }
}

export async function getUsernameAndLikeCount(_: Request, res: Response) {
    try {
        const id = res.locals.id;

        const generalData = await getUsernameAndLikeCountFunctionality(id);

        return res.send(generalData);
    } catch (error) {
        logger.error(error);
        return res.status(400).send({ error });
    }
}

export async function likeUser(_: Request, res: Response) {
    try {
        const { user, id: userToBeLikedId } = res.locals;

        const response = await likeUserFunctionality(user._id, userToBeLikedId);

        res.send(response);
    } catch (error) {
        logger.error(error);
        return res.status(400).send({ error });
    }
}

export async function unlikeUser(_: Request, res: Response) {
    try {
        const { user, id: userToBeLikedId } = res.locals;

        const response = await unlikeUserFunctionality(
            user._id,
            userToBeLikedId
        );

        res.send(response);
    } catch (error) {
        logger.error(error);
        return res.status(400).send({ error });
    }
}
