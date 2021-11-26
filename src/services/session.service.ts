import SessionModel, { SessionDocument } from "../models/session.model";
import { FilterQuery, UpdateQuery } from "mongoose";

export async function createSession(userId: string, userAgent: string | any) {
    const session = await SessionModel.create({ user: userId, userAgent });

    return session.toJSON();
}

export async function updateSession(
    query: FilterQuery<SessionDocument>,
    update: UpdateQuery<SessionDocument>
) {
    try {
        const response = await SessionModel.updateMany(query, update);
        if (response.modifiedCount == 0) {
            throw "Sessions were not updated.";
        }
        return;
    } catch (err) {
        throw err;
    }
}

export async function isSessionValid(userId: string) {
    try {
        let query: FilterQuery<SessionDocument> = { user: userId, valid: true };
        let sessions = await SessionModel.find(query);

        if (sessions.length) return true;
        else return false;
    } catch (error) {
        throw error;
    }
}
