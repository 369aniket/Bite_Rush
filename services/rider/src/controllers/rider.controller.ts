import axios from "axios";
import getBuffer from "../config/datauri.js";
import { AuthenticatedRequest } from "../middlewares/isAuth.js";
import TryCatch from "../middlewares/tryCatch.js";
import { Rider } from "../model/Rider.model.js";

export const addRiderProfile = TryCatch(async (req: AuthenticatedRequest, res) => {
    const user = req.user;

    if (!user) {
        return res.status(401)
            .json({
                message: 'Unauthorized'
            })
    }

    if (user.role !== 'rider') {
        return res.status(403)
            .json({
                message: "Only rider can create rider profile"
            })
    }

    const file = req.file;



    if (!file) {
        return res.status(400)
            .json({
                message: "Rider Image is Required",
            })
    }

    const fileBuffer = getBuffer(file)

    if (!fileBuffer?.content) {
        return res.status(500)
            .json({
                message: 'Failed to generate image buffer'
            })
    }

    const { data: uploadResult } = await axios.post(`${process.env.UTILS_SERVICE}/api/v1/upload`, { buffer: fileBuffer.content })

    console.log("Utils response:", uploadResult);

    const {
        phoneNumber,
        aadharNumber,
        drivingLicenseNumber,
        latitude,
        longitude
    } = req.body

    if (!phoneNumber || !aadharNumber || !drivingLicenseNumber || latitude === undefined || longitude === undefined) {
        return res.status(400)
            .json({
                message: "Missing credential's or All field's are required"
            })
    }

    const existingProfile = await Rider.findOne({
        userId: user._id,
    })

    if (existingProfile) {
        return res.status(400)
            .json({
                message: "Rider profile already exists"
            })
    }

    const riderProfile = await Rider.create({
        userId: user._id,
        picture: uploadResult.url,
        phoneNumber,
        aadharNumber,
        drivingLicenseNumber,
        location: {
            type: 'Point',
            coordinates: [longitude, latitude]
        },
        isAvailable: false,
        isVerified: false,
    })

    return res
        .status(201)
        .json({
            message: 'Rider Profile created successfully',
            riderProfile,
        })
})

export const fetchMyProfile = TryCatch(async (req: AuthenticatedRequest, res) => {
    const user = req.user;
    if (!user) {
        return res.status(401).json({ message: 'Unauthorized' })
    }

    const account = await Rider.findOne({ userId: user._id })

    return res.json({
        message: 'rider profile fetched successfully',
        account,
    })
})

export const toggleRiderAvailability = TryCatch(async (req: AuthenticatedRequest, res) => {
    const user = req.user;

    if (!user) {
        return res.status(401)
            .json({
                message: 'Unauthorized'
            })
    }

    if (user.role !== 'rider') {
        return res.status(403)
            .json({
                message: "Only rider can create rider profile"
            })
    }

    const { isAvailable, latitude, longitude } = req.body;

    if (typeof isAvailable !== 'boolean') {
        return res.status(400).json({ message: "isAvailable must be Boolean" })
    }

    if (latitude === undefined || longitude === undefined) {
        return res.status(400).json({ message: 'Location are required' })
    }

    const rider = await Rider.findOne({
        userId: user._id
    })

    if (!rider) {
        return res.status(404).json({ message: 'Rider not found' })
    }

    if (isAvailable && !rider.isVerified) {
        return res.status(403)
            .json({
                message: 'Rider is not verified'
            })
    }

    rider.isAvailable = isAvailable

    rider.location = {
        type: 'Point',
        coordinates: [longitude, latitude]
    };
    rider.lastActiveAt = new Date();

    await rider.save()

    res.json({
        message: isAvailable ? "Rider is now online" : 'Rider is now offline',
        rider,
    })
})

export const acceptOrder = TryCatch(async (req: AuthenticatedRequest, res) => {
    const riderUserId = req.user?._id;
    const { orderId } = req.params
    if (!riderUserId) {
        return res.status(400).json({ message: 'Please Login' })
    }

    const rider = await Rider.findOne({ userId: riderUserId, isAvailable: true })

    if (!rider) {
        return res.status(404).json({ message: 'Rider not found' })
    }

    try {
        const { data } = await axios.put(`${process.env.RESTAURANT_SERVICE}/api/v1/order/assign/rider`, {
            orderId,
            riderId: rider._id,
            riderUserId: rider.userId,
            riderName: rider.picture,
            riderPhone: rider.phoneNumber
        }, {
            headers: {
                'x-internal-key': process.env.INTERNAL_SERVICE_KEY,
            }
        })

        if (data.success) {
            const riderDetails = await Rider.findOneAndUpdate({
                userId: riderUserId,
                isAvailable: true,
            }, { isAvailable: false }, { new: true })

            res.json({message: 'Order accepted'})
        }
    } catch (error) {
        res.status(400).json({
            message: 'Order already taken'
        })
    }
})

export const fetchMyCurrentOrder = TryCatch(async( req: AuthenticatedRequest, res) => {
    const riderUserId = req.user?._id;

    if(!riderUserId){
        return res.status(400).json({message:'Please login'})
    }

    const rider = await Rider.findOne({userId: riderUserId, isVerified: true})
    if(!rider){
        return res.status(404).json({message: 'Rider not found'})
    }

    try {
        const { data } = await axios.get(`${process.env.RESTAURANT_SERVICE}/api/v1/order/current/rider?riderId=${rider._id}`,
            { 
                headers:{
                    'x-internal-key':process.env.INTERNAL_SERVICE_KEY
        }})

        res.json({order: data})

    } catch (error: any) {
        res.status(500)
        .json(
            { message: error?.response?.data?.message || "Something went wrong in fetching current Order"})
    }
})

export const updateOrderStatusByRider = TryCatch(async(req: AuthenticatedRequest, res) => {
    const userId = req.user?._id;
    if(!userId){
        return res.status(401).json({message: 'Please Login'})
    }

    const rider = await Rider.findOne({userId: userId})

    if(!rider){
        return res.status(404).json({message: 'Please Login'})
    }

    const { orderId } = req.params;

    try {
        const { data } = await axios.put(`${process.env.RESTAURANT_SERVICE}/api/v1/order/update/status/rider`,{orderId}, {
            headers: {
                'x-internal-key': process.env.INTERNAL_SERVICE_KEY,
            }
        })

        res.json({message:data.message})
    } catch (error) {
        res.status(500).json({message: 'Internal server error'})
    }
})