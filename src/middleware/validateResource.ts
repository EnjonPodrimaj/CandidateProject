import { Request, Response, NextFunction } from "express";
import { AnyZodObject } from "zod";

// middleware for validating inconming requests
const validateResource =
    (schema: AnyZodObject) =>
    (request: Request, response: Response, next: NextFunction) => {
        try {
            schema.parse({
                body: request.body,
                query: request.query,
                params: request.params,
            });
            next();
        } catch (err: any) {
            return response.status(400).send(err.errors);
        }
    };

export default validateResource;
