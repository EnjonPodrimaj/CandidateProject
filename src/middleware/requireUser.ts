import { Request, Response, NextFunction } from "express";

const requireUser = (req: Request, res: Response, next: NextFunction) => {
    const user = res.locals.user;

    if (!user) {
        return res.status(403).send({message: "This operation couldn't be carried due to invalid access token."});
    }

    return next();
};

export default requireUser;
