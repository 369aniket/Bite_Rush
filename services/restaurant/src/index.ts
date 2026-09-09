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
app.use(cors());
app.use(express.json());

app.use('/api/v1/restaurant', restaurantRoutes)
app.use('/api/v1/item', itemRoutes)
app.use('/api/v1/cart', cartRoutes)
app.use('/api/v1/address', addressRoutes)
app.use('/api/v1/order', orderRoutes)

const PORT = process.env.PORT || 5001;

app.listen(PORT, ()=>{
    console.log(`Restaurant service is running on PORT ${PORT}`)
    connectDB()
})