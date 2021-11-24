import { Request, Response, Express } from "express";
// import {validateResource} from "./middleware/validateResource";

function routes(app: Express) {
    app.get("/health-check", (req: Request, res: Response) => {
        const responseObj = {
            code: 200,
            status: "Very Healthy",
        };
        res.status(200).send(responseObj);
    });
}

export default routes;
