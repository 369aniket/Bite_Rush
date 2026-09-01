import dotenv from "dotenv";
import express from "express";
import connectDB from "./config/db.js";
import cors from 'cors'
import restaurantRoutes from './routes/restaurant.routes.js'
import itemRoute from './routes/menu.routes.js'

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/v1/restaurant', restaurantRoutes)
app.use('/api/v1/item', itemRoute)

const PORT = process.env.PORT || 5001;

app.listen(PORT, ()=>{
    console.log(`Restaurant service is running on PORT ${PORT}`)
    connectDB()
})