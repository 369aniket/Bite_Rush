import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.route.js";
import cors from "cors"

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/v1/auth", authRoutes)
const PORT = process.env.PORT || 5000;

app.listen(PORT, ()=>{
    console.log(`Auth service is running on PORT ${PORT}`)
    connectDB()
})
