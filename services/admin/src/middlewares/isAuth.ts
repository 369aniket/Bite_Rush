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
        if (!decodedToken || !decodedToken.user) {
            res.status(401).json({
                success: false,
                message: "Invalid token - User ID missing"
            });
            return; 
        }

        req.user = decodedToken.user;
        next(); 

    } catch (error) {

        console.error("Auth middleware error:", error);

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

export const isAdmin = async (req: AuthenticatedRequest, res: Response, next:NextFunction) => {
    try {
        if(!req.user) {
            res.status(401).json({
                message: 'Please Login'
            })
        }

        if(req.user?.role !== 'admin'){
            res.status(403).json({
                message: 'Access denied'
            })

            return ;
        }

        next()
    } catch (error) {
        res.status(401).json({
                message: 'Please Login'
            })
    }
}