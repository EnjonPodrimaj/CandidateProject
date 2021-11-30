import { Request, Response, Express } from "express";
import validateResource from "./middleware/validateResource";
import checkValidSession from "./middleware/checkValidSession";
import {
    userCreationHandler,
    getUserData,
    updateUser,
    getTheMostFamousOne,
    getUsernameAndLikeCount,
    likeUser,
    unlikeUser,
} from "./controllers/user.controller";
import { CreateUserSchema } from "./schemas/user.schema";
import { CreateSessionSchema } from "./schemas/session.schema";
import { createUserSessionHandler } from "./controllers/session.controller";
import requireUser from "./middleware/requireUser";

function routes(app: Express) {
    app.param(["id"], function (_, res, next, value) {
        res.locals.id = value;
        next();
    });

    app.get("/health-check", (_: Request, res: Response) => {
        const responseObj = {
            code: 200,
            status: "Very Healthy",
        };
        res.status(200).send(responseObj);
    });

    app.post(
        "/signup",
        validateResource(CreateUserSchema),
        userCreationHandler
    );

    app.post(
        "/login",
        validateResource(CreateSessionSchema),
        createUserSessionHandler
    );

    app.get("/me", requireUser, checkValidSession, getUserData);

    app.post("/me/update-password", requireUser, checkValidSession, updateUser);

    app.get("/user/:id", getUsernameAndLikeCount);

    app.get("/user/:id/like", requireUser, checkValidSession, likeUser);

    app.get("/user/:id/unlike", requireUser, checkValidSession, unlikeUser);

    app.get("/most-liked", getTheMostFamousOne);
}

export default routes;
