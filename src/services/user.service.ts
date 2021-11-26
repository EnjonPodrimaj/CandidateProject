import _, { omit } from "lodash";
import { DocumentDefinition } from "mongoose";
import UserModel, { UserDocument } from "../models/user.model";
import logger from "../utils/logger";
import bcrypt from "bcrypt";
import config from "config";

export async function createUser(
    input: DocumentDefinition<Omit<UserDocument, "comparePassword">>
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

export async function updateUserPassword(newPassword: string, id: string) {
    try {
        let hashedPassword = await hashPassword(newPassword);
        const updatedUser = UserModel.updateOne(
            { _id: id },
            { password: hashedPassword }
        );

        return updatedUser;
    } catch (err) {}
}

export async function validatePassword({
    email,
    password,
}: {
    email: string;
    password: string;
}) {
    const user = await UserModel.findOne({ email });

    if (!user) return false;

    const isValid = await user.comparePassword(password);
    if (!isValid) return false;

    return omit(user.toJSON(), "password");
}

export async function comparePassword(
    candidatePass: string,
    currentPass: string
) {
    try {
        return bcrypt.compare(candidatePass, currentPass);
    } catch (e) {
        return false;
    }
}

export async function getMostLiked() {
    const filter = {};
    const all = await UserModel.find(filter);
    let mostLiked = {};
    let num = 0;

    all.forEach((user) => {
        if (user.liked_from.length > num) {
            num = user.liked_from.length;
            mostLiked = {
                username: user.username,
                full_name: user.full_name,
            };
        }
    });

    return mostLiked;
}

export async function getUsername(id: string) {
    try {
        let user = await UserModel.findById(id);

        if (user) {
            const responseObject = {
                username: user?.username,
                likeCount: user?.liked_from?.length,
            };

            return responseObject;
        } else {
            throw { message: `User with id [${id}] was not found.` };
        }
    } catch (err) {
        return err;
    }
}

export async function likeUserFunctionality(
    userLikingId: string,
    userToBeLikedId: string
) {
    try {
        const user = await UserModel.findById(userToBeLikedId);

        if (!user) {
            throw `Could not find user. Id: ${userToBeLikedId}`;
        }

        user.liked_from?.length &&
            user.liked_from.forEach((item) => {
                if (item === userLikingId)
                    throw `This user is already liked from you.`;
            });

        user.liked_from.push(userLikingId);

        const res = await UserModel.updateOne(
            { _id: userToBeLikedId },
            { liked_from: user.liked_from }
        );
        if (res.acknowledged)
            return { message: `User ${user.username} liked successfully.` };
    } catch (err: any) {
        throw { message: err };
    }
}

export async function unlikeUserFunctionality(
    userLikingId: string,
    userToBeLikedId: string
) {
    try {
        const user = await UserModel.findById(userToBeLikedId);

        if (!user) {
            throw `Could not find user. Id: ${userToBeLikedId}`;
        }

        let alreadyLiked = false;
        user.liked_from?.length &&
            user.liked_from.forEach((item) =>
                item === userLikingId ? (alreadyLiked = true) : null
            );

        if (!alreadyLiked) {
            throw `Can't unlike user ${user.username} due to this user not being like from you in the first place.`;
        }

        _.remove(user.liked_from, (id) => {
            return id === userLikingId;
        });

        const res = await UserModel.updateOne(
            { _id: userToBeLikedId },
            { liked_from: user.liked_from }
        );
        if (res.acknowledged)
            return { message: `User ${user.username} unliked successfully.` };
    } catch (err: any) {
        throw { message: err };
    }
}

async function hashPassword(plainPassword: string) {
    const salt = await bcrypt.genSalt(config.get<number>("saltWorkFactor"));
    const hash = await bcrypt.hash(plainPassword, salt);

    return hash;
}
