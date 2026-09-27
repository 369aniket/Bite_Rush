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
// Specific routes
router.post('/new', isAuth, createOrder)
router.get('/my-orders', isAuth, getMyOrders)
router.get('/current/rider', getCurrentOrdersForRider)
router.put('/assign/rider', assignOrderToRider)
router.put('/update/status/rider', updateOrderStatusByRider)
router.get('/payment/:id', fetchOrderForPayment)
router.get('/restaurant/:restaurantId', isAuth, isSeller, fetchRestaurantOrders)

// Generic parameterized routes
router.get('/:id', isAuth, fetchSingleOrder)
router.put('/:orderId', isAuth, isSeller, updateOrderStatus)

export default router 