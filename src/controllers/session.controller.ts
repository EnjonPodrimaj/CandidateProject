import { Request, Response } from "express";
import { validatePassword } from "../services/user.service";
import { createSession, updateSession } from "../services/session.service";
import { signJwt } from "../utils/jwtUtils";
import logger from "../utils/logger";
import config from "config";

export async function createUserSessionHandler(req: Request, res: Response) {
    try {
        const user = await validatePassword(req.body);

        if (!user) {
            return res
                .status(401)
                .send({ error: "Invalid email or password." });
        }

        const session = await createSession(
            user._id,
            req.get("user-agent") || ""
        );

        const access_token = signJwt(
            { ...user, session: session._id },
            { expiresIn: config.get<string>("accessTokenTimeToLive") }
        );

        const refresh_token = signJwt(
            { ...user, session: session._id },
            { expiresIn: config.get<string>("refreshTokenTimeToLive") }
        );

        return res.send({ access_token, refresh_token });
    } catch (err) {
        logger.error(err);
        return res.status(500).send({ error: "Something went wrong." });
    }
}

export async function deleteSessionHandler(_: Request, res: Response) {
    try {
        const userId = res.locals.user._id;

        await updateSession({ user: userId }, { valid: false });
        return;
    } catch (error) {
        logger.error(error);
        return res.status(500).send({ error });
    }
}
