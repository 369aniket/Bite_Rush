import axios from "axios";
import getBuffer from "../config/datauri.js";
import { AuthenticatedRequest } from "../middlewares/isAuth.js";
import TryCatch from "../middlewares/tryCatch.js";
import MenuItem from "../models/Menu.model.js";
import Restaurant from "../models/Restaurant.model.js";

export const addMenuItem = TryCatch(async(req:AuthenticatedRequest, res) => {
    if(!req.user){
        return res.status(401)
        .json({
            message:"Please Login"
        })
    }

    const restaurant = await Restaurant.findOne({ownerId:req.user._id});

    if(!restaurant){
        return res.status(404).json({
            message:"No Restaurant found"
        })
    }

    const {name, description, price } = req.body;
    if(!name && !price){
        return res.status(400).json({message: "Name and Price are required"})
    }

    const file = req.file;

    if(!file){
        return res.status(400).json({message: 'Please give image'})
    }

    const fileBuffer = getBuffer(file);

    if(!fileBuffer?.content){
        return res.status(500).json({message: "Failed to create file Buffer"})
    }

    const { data: uploadResult } = await axios.post(`${process.env.UTILS_SERVICE}/api/v1/upload`,{buffer: fileBuffer.content})

    const item = await MenuItem.create({
        name,
        description,
        price,
        restaurantId: restaurant._id,
        image:uploadResult.url,
    })

    res.status(200).json({
        message: "Item Added Succefully",
        item,
    })
})


export const getAllItem = TryCatch(async (req:AuthenticatedRequest, res) => {
    const { id } = req.params;
    if(!id){
        return res.status(400).json({message: "Id is required"})
    }

    const items = await MenuItem.find({restaurantId: id})
    res.json(items)
})

export const deleteMenuItem = TryCatch(async (req:AuthenticatedRequest, res) => {
    if(!req.user){
        return res.status(401).json({message: "Please Login"})
    }

    const { itemId } = req.params;
    if(!itemId){
        return res.status(400).json({message: "Id is required"})
    }

    const item = await MenuItem.findById(itemId);
    if(!item){
        return res.status(404).json({message: "No Item found"})
    }

    const restaurant = await Restaurant.findOne({
        _id: item.restaurantId,
        ownerId: req.user._id
    })

    if(!restaurant){
        return res.status(404)
        .json({message: "No restaurant found"})
    }

    await item.deleteOne();

    res.json({message: 'Menu item deleted successfully'})
})

export const toggleMenuItemAvailability = TryCatch( async( req:AuthenticatedRequest, res) => {
    if(!req.user){
        return res.status(401).json({message: "Please Login"})
    }

    const { itemId } = req.params;
    if(!itemId){
        return res.status(400).json({message: "Id is required"})
    }

    const item = await MenuItem.findById(itemId);
    if(!item){
        return res.status(404).json({message: "No Item found"})
    }

    const restaurant = await Restaurant.findOne({
        _id: item.restaurantId,
        ownerId: req.user._id
    })

    if(!restaurant){
        return res.status(404)
        .json({message: "No restaurant found"})
    }

    item.isAvailable = !item.isAvailable;
    await item.save()
    res.json({message: `Item Marked as ${item.isAvailable ? "available" : "not available"}`, item})
}) 