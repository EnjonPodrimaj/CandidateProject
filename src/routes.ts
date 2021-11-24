import { Request, Response, Express, response } from "express";
import validateResource from "./middleware/validateResource";
// import {validateResource} from "./middleware/validateResource";
import { userCreationHandler } from "./controllers/user.controller";
import { request } from "http";
import { CreateUserSchema } from "./schemas/user.schema";

function routes(app: Express) {
    app.get("/health-check", (req: Request, res: Response) => {
        const responseObj = {
            code: 200,
            status: "Very Healthy",
        };
        res.status(200).send(responseObj);
    });

    app.post('/signup', validateResource(CreateUserSchema), userCreationHandler);
}

export default routes;
