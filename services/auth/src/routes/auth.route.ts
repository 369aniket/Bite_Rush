import express from "express";
import { addUserRole, loginUser } from "../controllers/auth.controller.js";
import { isAuth } from "../middlewares/isAuth.js";

const router = express.Router()
router.post('/login', loginUser)
router.put('/add/role', isAuth, addUserRole)
export default router;