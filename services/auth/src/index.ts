import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.route.js";
import cors from "cors"

dotenv.config();

const app = express();
app.use(cors({
    origin: (origin, callback) => {
        // Postman, curl, internal service calls (bina origin header wali requests) ko allow karein
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
        // Kisi bhi localhost port ya Vercel deployment (*.vercel.app) ko allow karein
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
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-internal-key'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/v1/auth", authRoutes)
const PORT = process.env.PORT || 5000;

app.listen(PORT, ()=>{
    console.log(`Auth service is running on PORT ${PORT}`)
    connectDB()
})
