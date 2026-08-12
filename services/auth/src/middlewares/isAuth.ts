import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { IUser } from "../model/User.model.js";
import User from "../model/User.model.js";

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

        console.log("🔍 Decoded Token:", JSON.stringify(decodedToken, null, 2));
        console.log("🔍 UserId:", decodedToken.userId);
        console.log("🔍 Email:", decodedToken.email);


        if (!decodedToken.userId) {
            res.status(401).json({
                success: false,
                message: "Invalid token - User ID missing"
            });
            return; 
        }

   
        const user = await User.findById(decodedToken.userId)
            .select('-token -tokenCreatedAt -password');
        
        if (!user) {
            res.status(401).json({
                success: false,
                message: "User not found"
            });
            return; 
        }

        req.user = user;
        next(); 

    } catch (error) {

        console.error("❌ Auth middleware error:", error);
        
    
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