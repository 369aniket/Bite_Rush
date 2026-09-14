import http from 'http'
import { Server, Socket } from 'socket.io'
import jwt, { JwtPayload } from 'jsonwebtoken'

let io: Server;

interface AuthTokenPayload {
    userId: string;
    name?: string;
    email?: string;
    role?: string;
    restaurantId?: string;
    [key: string]: any;
}

export const initSocket = (server: http.Server): Server => {
    io = new Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
    });

    io.use((socket: Socket, next) => {
        try {
            const token = socket.handshake.auth?.token;

            if (!token) {
                return next(new Error("Unauthorized: No token provided"));
            }

            const secret = process.env.JWT_SECRET;
            if (!secret) {
                console.error("Socket auth error: JWT_SECRET is not defined in .env");
                return next(new Error("Internal Server Error"));
            }

            const decoded = jwt.verify(token, secret) as AuthTokenPayload;

            if (!decoded || !decoded.userId) {
                return next(new Error("Unauthorized: User ID missing"));
            }

            // Normalizing payload into socket.data.user
            socket.data.user = {
                _id: decoded.userId,
                name: decoded.name,
                email: decoded.email,
                role: decoded.role,
                restaurantId: decoded.restaurantId
            };

            next();
        } catch (error: any) {
            console.error(`Socket auth failed: ${error.message}`);
            next(new Error("Unauthorized: " + error.message));
        }
    });

    io.on('connection', (socket: Socket) => {
        const user = socket.data.user;

        if (!user || !user._id) {
            socket.disconnect(true);
            return;
        }

        // Rooms without extra spaces
        socket.join(`user:${user._id}`);

        if (user.restaurantId) {
            socket.join(`restaurant:${user.restaurantId}`);
        }

        console.log(`User connected: ${user.name} (${user._id})`);
        console.log(`Active rooms:`, Array.from(socket.rooms));

        socket.on("disconnect", () => {
            console.log(`User disconnected: ${user._id}`);
        });
    });

    return io;
};

export const getIO = (): Server => {
    if (!io) {
        throw new Error('Socket.io not initialized');
    }
    return io;
};