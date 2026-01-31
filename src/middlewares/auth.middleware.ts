import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "Sporton123";

export interface AuthRequest extends Request {
    user?: any;
}

export const authenticate = (req:AuthRequest, res:Response, next:NextFunction): void => {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
        res.status(401).json({ message: "authentication required" })
        return;
    }
    try {
        const decoded = jwt.verify(token as string, JWT_SECRET);
        (req as AuthRequest).user = decoded;
        next();
    }catch (error) {
        console.log(error);
        res.status(401).json({ message: "invalid token" });
    }
};