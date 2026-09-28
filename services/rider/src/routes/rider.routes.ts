import express from 'express';
import { isAuth } from '../middlewares/isAuth.js';
import { acceptOrder, addRiderProfile, fetchMyCurrentOrder, fetchMyDeliveredOrders, fetchMyProfile, toggleRiderAvailability, updateOrderStatusByRider } from '../controllers/rider.controller.js';
import uploadFile from '../middlewares/multer.js';

const router = express.Router()

router.post(`/new`, isAuth, uploadFile, addRiderProfile)
router.get(`/my-profile`, isAuth, fetchMyProfile)
router.patch(`/toggle`,isAuth, toggleRiderAvailability)
router.get('/order/current', isAuth, fetchMyCurrentOrder)
router.get(`/delivered-orders`, isAuth, fetchMyDeliveredOrders)
router.get(`/earnings`, isAuth, fetchMyDeliveredOrders)
router.post('/accept/:orderId', isAuth, acceptOrder)
router.put('/order/update/:orderId',isAuth, updateOrderStatusByRider )

export default router