import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

export interface IUser {
    _id: string;
    name: string;
    email: string;
    image: string;
    role: string;
    restaurantId: string;
}

export interface AuthenticatedRequest extends Request {
    user?: IUser | null;
}

export const isAuth = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            res.status(401).json({
                success: false,
                message: "Please login - No auth header"
            });
            return;
        }

        const token = authHeader.split(' ')[1];


        if (!token) {
            res.status(401).json({
                success: false,
                message: "Please login - Token missing"
            });
            return;
        }


        let decodedToken: JwtPayload;
        try {
            decodedToken = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;

            if (!decodedToken) {
                res.status(401).json({ message: "Token is missin or Invalid" })
                return
            }

                req.user = {
                _id: decodedToken.userId || '',
                name: decodedToken.name || '',
                email: decodedToken.email || '',
                role: decodedToken.role || 'customer',
                restaurantId: decodedToken.restaurantId || '',
                image: decodedToken.image || ''
            };

            next();
        } catch (jwtError) {

            if (jwtError instanceof jwt.TokenExpiredError) {
                res.status(401).json({
                    success: false,
                    message: "Token expired - Please login again"
                });
                return;
            }

            res.status(401).json({
                success: false,
                message: "Invalid token - Please login again"
            });
            return;
        }


    } catch (error) {

        console.error(" Auth middleware error:", error);


        if (!res.headersSent) {
            res.status(500).json({
                success: false,
                message: "Authentication failed",
                error: error instanceof Error ? error.message : "Unknown error"
            });
        }
        return;
    }
};


export const isSeller = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    const user = req.user;

    if (!user) {
        res
            .status(401)
            .json({ message: "Please login first" })
        return
    }

    if (user.role !== "seller") {
        res
            .status(403)
            .json({ message: "You are not authorized as a seller" });
        return
    }

    next();
}