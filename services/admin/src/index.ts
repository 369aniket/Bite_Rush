import express from "express";
import dotenv from "dotenv"; 
import cors from "cors"
import { connectDB }from "./config/db.js";
import adminRoutes from './routes/admin.routes.js'

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/v1/admin', adminRoutes)

const PORT = process.env.PORT || 5006;

connectDB();

app.listen(PORT, ()=>{
    console.log(`Admin service is running on PORT ${PORT}`)

})
