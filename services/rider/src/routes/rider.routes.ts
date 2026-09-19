import express from 'express';
import { isAuth } from '../middlewares/isAuth.js';
import { acceptOrder, addRiderProfile, fetchMyCurrentOrder, fetchMyProfile, toggleRiderAvailability, updateOrderStatusByRider } from '../controllers/rider.controller.js';
import uploadFile from '../middlewares/multer.js';

const router = express.Router()

router.post(`/new`, isAuth, uploadFile, addRiderProfile)
router.get(`/my-profile`, isAuth, fetchMyProfile)
router.patch(`/toggle`, isAuth, toggleRiderAvailability)
router.post('/accept/:orderId', isAuth, acceptOrder)
router.get('/order/current', isAuth, fetchMyCurrentOrder)
router.put('/order/update/:orderId',isAuth, updateOrderStatusByRider )

export default router