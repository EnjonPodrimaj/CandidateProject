import { Request, Response } from "express";
import { validatePassword } from "../services/user.service";
import { createSession, updateSession } from "../services/session.service";
import { signJwt } from "../utils/jwtUtils";
import config from "config";

export async function createUserSessionHandler(req: Request, res: Response) {
    const user = await validatePassword(req.body);

    if (!user) {
        return res.status(401).send({ error: "Invalid email or password" });
    }

    const session = await createSession(user._id, req.get("user-agent") || "");

    const access_token = signJwt(
        { ...user, session: session._id },
        { expiresIn: config.get<string>("accessTokenTimeToLive") }
    );

    const refresh_token = signJwt(
        { ...user, session: session._id },
        { expiresIn: config.get<string>("refreshTokenTimeToLive") }
    );

    return res.send({ access_token, refresh_token });
}

export async function deleteSessionHandler(req: Request, res: Response) {
    const sessionId = res.locals.user.session;

    await updateSession({ _id: sessionId }, { valid: false });

    return res.send({
        accessToken: null,
        refreshToken: null,
    });
}
