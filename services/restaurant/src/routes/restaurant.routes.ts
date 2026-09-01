import express from "express";
import { isAuth, isSeller } from "../middlewares/isAuth.js";
import { addRestaurant, fetchRestaurant, updateRestaurant, updateStatusRestaurant } from "../controllers/restaurant.controller.js";
import uploadFile from "../middlewares/multer.js";



const router = express.Router()

router.post('/new', isAuth, isSeller, uploadFile, addRestaurant);
router.get('/my', isAuth, isSeller, fetchRestaurant);
router.put(`/status`, isAuth, isSeller, updateStatusRestaurant)
router.put(`/edit`, isAuth, isSeller, updateRestaurant)


export default router;