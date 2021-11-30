import _, { omit } from "lodash";
import { DocumentDefinition } from "mongoose";
import UserModel, { UserDocument } from "../models/user.model";
import bcrypt from "bcrypt";
import config from "config";

export async function createUser(
    input: DocumentDefinition<Omit<UserDocument, "comparePassword">>
) {
    try {
        const user = await UserModel.create(input);

        if (!user) {
            throw "Got no response from Create User function.";
        }

        return omit(user.toJSON(), "password");
    } catch (error: any) {
        throw error;
    }
}

export async function validatePassword({
    email,
    password,
}: {
    email: string;
    password: string;
}) {
    try {
        const user = await UserModel.findOne({ email });

        if (!user) return false;

        const isValid = await user.comparePassword(password);
        if (!isValid) return false;

        return omit(user.toJSON(), "password");
    } catch (error: any) {
        throw error;
    }
}

export async function comparePassword(
    candidatePass: string,
    currentPass: string
) {
    try {
        return bcrypt.compare(candidatePass, currentPass);
    } catch (_) {
        return false;
    }
}

export async function getMostLiked() {
    try {
        const filter = {};
        const all = await UserModel.find(filter);
        let mostLiked = {};
        let num = 0;

        if (!all || !all.length) {
            throw "There is no user registered yet.";
        }

        all.forEach((user) => {
            if (user.liked_from.length > num) {
                num = user.liked_from.length;
                mostLiked = {
                    username: user.username,
                    full_name: user.full_name,
                };
            }
        });

        let keys = Object.keys(mostLiked);
        if (!keys.length) throw "There have been no likes yet!";
        else return mostLiked;
    } catch (error) {
        throw error;
    }
}

export async function getUsernameAndLikeCountFunctionality(id: string) {
    try {
        let user = await UserModel.findById(id);

        if (user) {
            const responseObject = {
                username: user?.username,
                likeCount: user?.liked_from?.length,
            };

            return responseObject;
        } else {
            throw `User with id [${id}] was not found.`;
        }
    } catch (error) {
        throw error;
    }
}

export async function updateUserFunctionality(
    id: string,
    email: string,
    oldToBePassword: string,
    newPassword: string,
    newPasswordConfirmation: string
) {
    try {
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
                    throw "Current password is wrong.";
                } else {
                    secondPassCheck = oldToBePassword === newPassword;

                    if (secondPassCheck) {
                        throw "New Password is the same as the old passsword.";
                    }

                    updateResponse = await updateUserPassword(id, newPassword);
                }
            } else {
                throw "New passwords do not match.";
            }

            if (updateResponse) {
                return { message: "Password changed successfully." };
            } else {
                throw "Something went wrong";
            }
        }
    } catch (error) {
        throw error;
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
                if (item === userLikingId) {
                    throw `This user is already liked from you.`;
                }
            });

        user.liked_from.push(userLikingId);

        const res = await UserModel.updateOne(
            { _id: userToBeLikedId },
            { liked_from: user.liked_from }
        );

        if (res.acknowledged) {
            return { message: `User ${user.username} liked successfully.` };
        }
    } catch (error: any) {
        throw error;
    }
}

export async function unlikeUserFunctionality(
    userLikingId: string,
    userToBeLikedId: string
) {
    try {
        const user = await UserModel.findById(userToBeLikedId);
        let alreadyLiked = false;

        if (!user) {
            throw `Could not find user. Id: ${userToBeLikedId}`;
        }

        user.liked_from?.length &&
            user.liked_from.forEach((item) =>
                item === userLikingId ? (alreadyLiked = true) : null
            );

        if (!alreadyLiked) {
            throw `Can't unlike user ${user.username} due to this user not being liked from you in the first place.`;
        }

        _.remove(user.liked_from, (id) => {
            return id === userLikingId;
        });

        const res = await UserModel.updateOne(
            { _id: userToBeLikedId },
            { liked_from: user.liked_from }
        );

        if (res.acknowledged) {
            return { message: `User ${user.username} unliked successfully.` };
        }
    } catch (error: any) {
        throw error;
    }
}

async function updateUserPassword(id: string, newPassword: string) {
    try {
        let hashedPassword = await hashPassword(newPassword);
        const updatedUser = UserModel.updateOne(
            { _id: id },
            { password: hashedPassword }
        );

        return updatedUser;
    } catch (error) {
        throw error;
    }
}

async function hashPassword(plainPassword: string) {
    try {
        const salt = await bcrypt.genSalt(config.get<number>("saltWorkFactor"));
        const hash = await bcrypt.hash(plainPassword, salt);

        return hash;
    } catch (error) {
        throw error;
    }
}
