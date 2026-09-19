import express from 'express' ;
import { isAuth, isSeller } from '../middlewares/isAuth.js';
import { 
    createOrder, 
    fetchOrderForPayment, 
    fetchRestaurantOrders, 
    updateOrderStatus,
    getMyOrders,
    fetchSingleOrder,
    assignOrderToRider,
    getCurrentOrdersForRider,
    updateOrderStatusByRider
} from '../controllers/order.controller.js';

const router = express.Router()
router.post('/new', isAuth, createOrder)
router.get('/my-orders', isAuth, getMyOrders)
router.get('/:id', isAuth, fetchSingleOrder)
router.get('/payment/:id', fetchOrderForPayment)
router.get('/restaurant/:restaurantId', isAuth, isSeller, fetchRestaurantOrders)
router.put('/:orderId', isAuth, isSeller, updateOrderStatus)
router.put('/assign/rider', assignOrderToRider)
router.get('/current/rider', getCurrentOrdersForRider)
router.put('/update/status/rider', updateOrderStatusByRider)

export default router 