import express from 'express'
import { getPendingRestaurants, getPendingRiders, verifyRestaurant, verifyRider } from '../controllers/admin.controller.js'
import { isAdmin, isAuth } from '../middlewares/isAuth.js'

const router = express.Router()

router.get('/restaurant/pending',isAuth, isAdmin, getPendingRestaurants)
router.get('/rider/pending', isAuth, isAdmin, getPendingRiders)
router.patch('/verify/rider/:id', isAuth, isAdmin, verifyRider)
router.patch('/verify/restaurant/:id', isAuth, isAdmin, verifyRestaurant)


export default router