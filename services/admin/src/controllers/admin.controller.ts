import { ObjectId } from 'mongodb'
import TryCatch from '../middlewares/Trycatch.js';
import { getRestaurantCollection, getRiderCollection } from '../utils/collections.js'

export const getPendingRestaurants = TryCatch(async (req, res) => {
    const restaurants = await (await getRestaurantCollection()).find({
        isVerified: false
    }).toArray()

    res.json({
        count: restaurants.length,
        restaurants
    })
})

export const getPendingRiders = TryCatch(async (req, res) => {
    const riders = await (await getRiderCollection()).find({
        isVerified: false
    }).toArray()

    res.json({
        count: riders.length,
        riders
    })
})

export const verifyRestaurant = TryCatch(async(req, res) => {
    const { id } = req.params;

    if(typeof id !== 'string'){
        return res.status(400).json({
            message: 'Invalid Restaurant Id'
        })
    }

    if(!ObjectId.isValid(id)){
        return res.status(400).json({
            message: 'Invalid Object Id'
        })
    }

    const result = await (await getRestaurantCollection()).updateOne({_id: new ObjectId(id)}, {
        $set: {
            isVerified: true,
            updatedAt: new Date(),
        }
    })

    if(result.matchedCount === 0){
        return res.status(404).json({
            message: 'Restaurant not found'
        })
    }

    res.json({
        message: "Restaurant is Verified successfully"
    })
})


export const verifyRider = TryCatch(async(req, res) => {
    const { id } = req.params;

    if(typeof id !== 'string'){
        return res.status(400).json({
            message: 'Invalid Rider Id'
        })
    }

    if(!ObjectId.isValid(id)){
        return res.status(400).json({
            message: 'Invalid Object Id'
        })
    }

    const result = await (await getRiderCollection()).updateOne({_id: new ObjectId(id)}, {
        $set: {
            isVerified: true,
            updatedAt: new Date(),
        }
    })

    if(result.matchedCount === 0){
        return res.status(404).json({
            message: 'Rider not found'
        })
    }

    res.json({
        message: "Rider is Verified successfully"
    })
})