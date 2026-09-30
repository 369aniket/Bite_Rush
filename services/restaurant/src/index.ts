import dotenv from "dotenv";
import express from "express";
import connectDB from "./config/db.js";
import cors from 'cors'
import restaurantRoutes from './routes/restaurant.routes.js'
import itemRoutes from './routes/menu.routes.js'
import cartRoutes from './routes/cart.routes.js'
import addressRoutes from './routes/address.routes.js'
import orderRoutes from './routes/order.routes.js'
import { connectRabbitMQ } from "./config/rabbitmq.js";
import { startPaymentConsumer } from "./config/payment.consumer.js";

dotenv.config();

await connectRabbitMQ();
startPaymentConsumer();

const app = express();

app.use(cors({
    origin: (origin, callback) => {
        // Postman, curl, ya internal service calls ko allow karein
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
        // Kisi bhi localhost port ya Vercel domain ko auto-allow karein
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

app.use('/api/v1/restaurant', restaurantRoutes)
app.use('/api/v1/item', itemRoutes)
app.use('/api/v1/cart', cartRoutes)
app.use('/api/v1/address', addressRoutes)
app.use('/api/v1/order', orderRoutes)

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
    console.log(`Restaurant service is running on PORT ${PORT}`)
    connectDB()
})