import { Request, Response, Express } from "express";
import validateResource from "./middleware/validateResource";
import extractId from "./middleware/extractId";
import {
    userCreationHandler,
    getUserData,
    updateUser,
    getTheMostFamousOne,
    getUsernameAndLikeCount
} from "./controllers/user.controller";
import { CreateUserSchema } from "./schemas/user.schema";
import { CreateSessionSchema } from "./schemas/session.schema";
import { createUserSessionHandler } from "./controllers/session.controller";
import requireUser from "./middleware/requireUser";

function routes(app: Express) {
    app.get("/health-check", (req: Request, res: Response) => {
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

    app.get("/me", requireUser, getUserData);

    app.post("/me/update-password", requireUser, updateUser);

    app.get("/user/*", extractId, getUsernameAndLikeCount);

    app.get('/most-liked', getTheMostFamousOne);
}

export default routes;
