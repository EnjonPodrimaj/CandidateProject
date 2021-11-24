import { omit } from "lodash";
import { DocumentDefinition } from "mongoose";
import UserModel, { UserDocument } from "../models/user.model";
import logger from "../utils/logger";

export async function createUser(
    input: DocumentDefinition<Omit<UserDocument, "comparePassword">
    >
) {
    try {
        const user = await UserModel.create(input);
        if (user) {
            return omit(user.toJSON(), "password");
        } else throw "Got no response from creating user method.";
    } catch (err: any) {
        logger.error(err);
        throw new Error(err);
    }
}
