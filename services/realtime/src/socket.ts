import http from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';

let io: Server;

interface AuthTokenPayload {
    user: {
        _id: string;
        name?: string;
        email?: string;
        role?: string;
        restaurantId?: string;
        image?: string;
    };
    iat?: number;
    exp?: number;
}

export const initSocket = (server: http.Server): Server => {
    io = new Server(server, {
        cors: {
            origin: (origin, callback) => {
                if (!origin) return callback(null, true);

                const normalized = origin.trim().replace(/\/$/, '');
                const envOrigins = process.env.CLIENT_URL
                    ? process.env.CLIENT_URL.split(',').map((u) => u.trim().replace(/\/$/, ''))
                    : [];

                const allowedList = [
                    'http://localhost:5173',
                    'http://localhost:5174',
                    'http://localhost:3000',
                    'http://127.0.0.1:5173',
                    'https://bite-rush-nu4z.vercel.app',
                    ...envOrigins,
                ];

                // Kisi bhi localhost port ya Vercel domain (*.vercel.app) ko allow karein
                if (
                    allowedList.includes(normalized) ||
                    normalized.startsWith('http://localhost:') ||
                    normalized.startsWith('http://127.0.0.1:') ||
                    normalized.endsWith('.vercel.app')
                ) {
                    return callback(null, true);
                }

                return callback(null, true);
            },
            methods: ['GET', 'POST'],
            credentials: true,
            allowedHeaders: ['Content-Type', 'Authorization', 'x-internal-key'],
        },
    });

    io.use((socket: Socket, next) => {
        try {
            const token = socket.handshake.auth?.token;

            if (!token) {
                return next(new Error('Unauthorized: No token provided'));
            }

            const secret = process.env.JWT_SECRET;

            if (!secret) {
                console.error('Socket auth error: JWT_SECRET is not defined in .env');
                return next(new Error('Internal Server Error'));
            }

            const decoded = jwt.verify(token, secret) as AuthTokenPayload;

            const user = decoded.user;

            if (!user || !user._id) {
                return next(new Error('Unauthorized: User ID missing'));
            }

            socket.data.user = {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                restaurantId: user.restaurantId,
                image: user.image,
            };

            next();
        } catch (error: any) {
            console.error(`Socket auth failed: ${error.message}`);
            next(new Error('Unauthorized: ' + error.message));
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

        // Rider live location update broadcast
        socket.on('rider:location:update', (data: { targetUserId: string; latitude: number; longitude: number }) => {
            if (!data?.targetUserId || data.latitude == null || data.longitude == null) return;
            io.to(`user:${data.targetUserId}`).emit('rider:location', {
                latitude: data.latitude,
                longitude: data.longitude,
            });
        });

        socket.on('disconnect', () => {
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