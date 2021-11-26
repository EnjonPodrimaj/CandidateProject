import { Request, Response, NextFunction } from "express";

const extraxtId = (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.query;
    
    if (!id) {
        console.log("That didn't work.")
    }

    res.locals.id = id;

    return next();
};

export default extraxtId;
