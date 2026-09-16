import express from 'express' ;
import { isAuth, isSeller } from '../middlewares/isAuth.js';
import { 
    createOrder, 
    fetchOrderForPayment, 
    fetchRestaurantOrders, 
    updateOrderStatus,
    getMyOrders,
    fetchSingleOrder
} from '../controllers/order.controller.js';

const router = express.Router()
router.post('/new', isAuth, createOrder)
router.get('/my-orders', isAuth, getMyOrders)
router.get('/:id', isAuth, fetchSingleOrder)
router.get('/payment/:id', fetchOrderForPayment)
router.get('/restaurant/:restaurantId', isAuth, isSeller, fetchRestaurantOrders)
router.put('/:orderId', isAuth, isSeller, updateOrderStatus)


export default router 