import axios from "axios";
import getBuffer from "../config/datauri.js";
import { AuthenticatedRequest } from "../middlewares/isAuth.js";
import TryCatch from "../middlewares/tryCatch.js";
import Restaurant from "../models/Restaurant.model.js";
import jwt from 'jsonwebtoken'

export const addRestaurant = TryCatch(async (req: AuthenticatedRequest, res) => {
    const user = req.user;

    if (!user) {
        return res.status(401).json("Unauthorized")
    }

    const existingRestaurant = await Restaurant.findOne({ ownerId: user._id })

    if (existingRestaurant) {
        return res.status(400).json("You already have a restuarant")
    }

    const { name, description, latitude, longitude, formatedAddress, phone } = req.body;


    if (!name || !latitude || !longitude) {
        return res.status(400).json("Please give all details")
    }

    const file = req.file;

    if (!file) {
        return res.status(400).json("Please give Image")
    }

    const fileBuffer = getBuffer(file);

    if (!fileBuffer) {
        return res.status(500).json({ message: "Failed to create file buffer" })
    }


    const { data: uploadResult } = await axios.post(`${process.env.UTILS_SERVICE}/api/v1/upload`, { buffer: fileBuffer.content })

    const restaurant = await Restaurant.create({
        name,
        description,
        phone,
        image: uploadResult.url,
        ownerId: user._id,
        autoLocation: {
            type: "Point",
            coordinates: [Number(longitude), Number(latitude)],
            formatedAddress,
        },
        isVerified: false
    })



    return res
        .status(201)
        .json({
            message: "Reastaurant created succeffully ",
            restaurant,
        });
})


export const fetchRestaurant = TryCatch(async (req: AuthenticatedRequest, res) => {
    if (!req.user) {
        return res
            .status(401)
            .json('Please Login')
    }

    const restaurant = await Restaurant.findOne({ ownerId: req.user._id });

    if (!restaurant) {
        return res
            .status(400)
            .json('Restaurant Not found')
    }

    if (!req.user.restaurantId) {
        const expiresIn = Number(process.env.TOKEN_EXPIRY ?? 86400);

        const token = jwt.sign(
            {
                user: {
                    ...req.user,
                    restaurantId: restaurant._id,
                },
            },
            process.env.JWT_SECRET as string,
            { expiresIn }
        );

        return res.json({ restaurant, token })
    }

    res.json({ restaurant })
})

export const updateStatusRestaurant = TryCatch(async (req: AuthenticatedRequest, res) => {
    if (!req.user) {
        return res.status(403).json({ message: "Please Login" })

    }

    const { status } = req.body;
    if (typeof status !== "boolean") {
        return res.status(400).json({ message: "Status must be boolean" })
    }

    const restaurant = await Restaurant.findOneAndUpdate({ ownerId: req.user._id }, { isOpen: status }, { new: true });

    if (!restaurant) {
        return res
            .status(404)
            .json({ message: "Restaurant not found" })
    }

    res.json({
        message: "Restaurant status updated",
        restaurant
    })
})


export const updateRestaurant = TryCatch(async (req: AuthenticatedRequest, res) => {
    if (!req.user) {
        return res.status(403).json({ message: "Please Login" })
    }

    const { name, description } = req.body;

    const restaurant = await Restaurant.findOneAndUpdate({ ownerId: req.user._id }, { name: name, description: description }, { new: true })

    if (!restaurant) {
        return res.status(400)
            .json({ message: "Restaurant not found" })
    }

    res.json({
        message: "Restaurant Updated",
        restaurant
    })
})

export const getNearbyRestaurant = TryCatch(async (req: AuthenticatedRequest, res) => {
    const { latitude, longitude, radius = 5000, search = "" } = req.query;

    if (!latitude || !longitude) {
        return res
            .status(400)
            .json({ message: "Latitude and Longitude are required" })
    }

    const query: any = {
        isVerified: true,
    }

    if (search && typeof search === "string") {
        query.name = { $regex: search, options: 'i' }
    }

    const restaurants = await Restaurant.aggregate([
        {
            $geoNear: {
                near: {
                    type: "Point",
                    coordinates: [Number(longitude), Number(latitude)]
                },
                distanceField: "distance",
                maxDistance: Number(radius),
                spherical: true,
                query,
            }
        },
        {
            $sort: {
                isOpen: -1,
                distance: 1,
            }
        },

        {
            $addFields: {
                distanceKm: {
                    $round: [{ $divide: ["$distance", 1000] }, 2],
                }
            }
        }

    ]);

    res.json({
        success: true,
        count: restaurants.length,
        restaurants,
    })
})


export const fetchSingalRestaurant = TryCatch(async (req: AuthenticatedRequest, res) => {
    const restaurant = await Restaurant.findById(req.params.id);

    res.json(restaurant);
})