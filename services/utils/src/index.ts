import express from "express";
import dotenv from "dotenv";
import cloudinary from 'cloudinary';
import cors from 'cors';
import uploadRoutes from './routes/cloudinary.js'
import { connectRabbitMQ } from "./config/rabbitMQ.js";
import paymentRoutes from './routes/payment.js'


dotenv.config()

connectRabbitMQ()

const app = express()
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


app.use(express.json({ limit: "50mb" }))
app.use(express.urlencoded({ limit:"50mb", extended: true }))

const {CLOUD_NAME, CLOUD_SECRET_KEY, CLOUD_API_KEY} = process.env;

if(!CLOUD_NAME || !CLOUD_API_KEY || !CLOUD_SECRET_KEY){
    throw new Error("Missing Cloudinary environment variables");
}

cloudinary.v2.config({
    cloud_name: CLOUD_NAME,
    api_key: CLOUD_API_KEY,
    api_secret:CLOUD_SECRET_KEY,
})

app.use('/api/v1', uploadRoutes)
app.use('/api/v1/payment', paymentRoutes)

const PORT = process.env.PORT || 5002

app.listen(PORT, ()=>{
    console.log(`Utils service running on ${PORT}`);
})
