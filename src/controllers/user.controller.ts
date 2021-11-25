import { Request, Response } from "express";
import { CreateUserInput } from "../schemas/user.schema";
import {
    comparePassword,
    createUser,
    updateUserPassword,
    getMostLiked,
    getUsername,
} from "../services/user.service";
import UserModel from "../models/user.model";
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

export async function getUserData(req: Request, res: Response) {
    try {
        const user = res.locals.user;

        if (!user)
            return res.status(500).send({ message: "Could not get user." });

        return res.send(user);
    } catch (err: any) {
        logger.error(err);
        return res.status(409).send(err.message);
    }
}

export async function updateUser(req: Request, res: Response) {
    try {
        const { oldToBePassword, newPassword, newPasswordConfirmation } =
            req.body;
        let { email } = res.locals.user;
        const user = await UserModel.findOne({ email });

        if (user) {
            const currentPass = user.password;

            const sameNewPasswords = newPassword === newPasswordConfirmation;
            let firstPassCheck;
            let secondPassCheck;
            let updateResponse;

            if (sameNewPasswords) {
                firstPassCheck = await comparePassword(
                    oldToBePassword,
                    currentPass
                );

                if (!firstPassCheck) {
                    return res
                        .status(400)
                        .send({ message: "Current password is wrong." });
                } else {
                    secondPassCheck = oldToBePassword === newPassword;
                    if (secondPassCheck)
                        return res.status(400).send({
                            message:
                                "New Password is the same as the old passsword.",
                        });

                    updateResponse = updateUserPassword(
                        newPassword,
                        res.locals.user._id
                    );
                }
            } else
                res.status(400).send({
                    message: "New passwords do not match.",
                });

            if (updateResponse)
                return res.send({ message: "Password changed successfully." });
        }
    } catch (err) {
        logger.error(err);
        return res.status(500).send("There was an issue while updating user.");
    }
}

export async function getTheMostFamousOne(req: Request, res: Response) {
    try {
        const mostLiked = await getMostLiked();
        return res.send(mostLiked);
    } catch (err) {
        logger.error("Something weird happened.");
        console.error(err);
    }
}

export async function getUsernameAndLikeCount(req: Request, res: Response) {
    try {
        const id = res.locals.id;

        const generalData = await getUsername(id);
        
        return res.send(generalData);
    } catch (err) {
        logger.error("Something weird happened.");
        console.error(err);
        return res.status(400).send(err);
    }
}
