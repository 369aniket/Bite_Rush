import axios from "axios";
import { AuthenticatedRequest } from "../middlewares/isAuth.js";
import TryCatch from "../middlewares/tryCatch.js";
import Address from "../models/Address.model.js";
import Cart from "../models/Cart.model.js";
import { IMenu } from "../models/Menu.model.js";
import Order from "../models/Order.model.js";
import Restaurant, { IRestaurant } from "../models/Restaurant.model.js";
import { publishEvent } from "../config/order.publisher.js";

export const createOrder = TryCatch(async (req: AuthenticatedRequest, res) => {
    const user = req.user;
    if (!user) {
        return res.status(401).json({ message: "Unauthorized" })
    }

    const { paymentMethod, addressId } = req.body;
    if (!addressId) {
        return res.status(404).json({ message: "Address is required" })
    }

    const address = await Address.findOne({
        _id: addressId,
        userId: user._id,
    })

    if (!address) {
        return res.status(404).json({
            message: "Address is not found"
        })
    }

    const getDistanceKm = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
        const R = 6371;
        const dLat = ((lat2 - lat1) * Math.PI) / 180;
        const dLon = ((lon2 - lon1) * Math.PI) / 180;

        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

        return +(R * c).toFixed(2)
    }

    const cartItems = await Cart.find({ userId: user._id })
        .populate<{ itemId: IMenu }>("itemId")
        .populate<{ restaurant: IRestaurant }>("restaurantId")

    if (cartItems.length === 0) {
        return res.status(400).json({ message: "Cart is Empty" })
    }

    const firstCartItem = cartItems[0];

    if (!firstCartItem || !firstCartItem.restaurantId) {
        return res.status(400).json({
            message: "Invalid Cart Data"
        })
    }

    const restaurantId = firstCartItem.restaurantId._id;
    const restaurant = await Restaurant.findById(restaurantId);

    if (!restaurant) {
        return res.status(404).json({ message: "No restaurant with this id" })
    }

    if (!restaurant.isOpen) {
        return res.status(400).json({ message: "Oops this restaurant is closed for now" })
    }

    const distance = getDistanceKm(
        address.location.coordinates[1],
        address.location.coordinates[0],
        restaurant.autoLocation.coordinates[1],
        restaurant.autoLocation.coordinates[0],
    );
    let subTotal = 0;

    const orderItems = cartItems.map((cart) => {
        const item = cart.itemId;

        if (!item) {
            throw new Error("Invalid cart item")
        }

        const itemTotal = item.price * cart.quantity

        subTotal += itemTotal

        return {
            itemId: item._id.toString(),
            name: item.name,
            price: item.price,
            quantity: cart.quantity,
        }
    })

    const delivaryFee = subTotal < 250 ? 49 : 0;
    const platfromFee = 7;
    const totalAmount = subTotal + delivaryFee + platfromFee;

    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    const [longitude, latitude] = address.location.coordinates;

    const riderAmount = Math.ceil(distance) * 17

    const order = await Order.create({
        userId: user._id.toString(),
        restaurantId: restaurantId.toString(),
        restaurantName: restaurant.name,
        riderId: null,
        distance,
        riderAmount,
        items: orderItems,
        subTotal,
        delivaryFee,
        platfromFee,
        totalAmount,
        addressId: address._id,
        delivaryAddress: {
            formattedAddress: address.formattedAddress,
            mobile: address.mobile,
            latitude,
            longitude,
        },
        paymentMethod,
        paymentStatus: "pending",
        status: "placed",
        expiresAt,

    })

    await Cart.deleteMany({ userId: user._id });

    res.json({
        success: true,
        message: "Order create successfuly",
        orderId: order._id.toString(),
        amount: totalAmount
    })
})

export const fetchOrderForPayment = TryCatch(async (req, res) => {
    if (req.headers['x-internal-key'] !== process.env.INTERNAL_SERVICE_KEY) {
        return res.status(403).json({
            message: "Forbidden",
        })
    }

    const order = await Order.findById(req.params.id)

    if (!order) {
        return res.status(404).json({ message: "Order not found" })
    }

    if (order.paymentStatus !== "pending") {
        return res.status(400).json({
            message: "Order already paid"
        })
    }

    res.json({
        orderId: order._id,
        amount: order.totalAmount,
        currency: "INR",
    })
})

export const fetchRestaurantOrders = TryCatch(async (req: AuthenticatedRequest, res) => {
    const user = req.user;

    const { restaurantId } = req.params;

    if (!user) {
        return res.status(400).json({ message: "Unauthorized or user is missing" })
    }

    if (!restaurantId) {
        return res.status(400).json({ message: "RestaurantId is missing" })
    }


    const { limit } = req.query.limit ? Number(req.query.limit) : 0;

    const orders = await Order.find({
        restaurantId,
        paymentStatus: 'paid',
    }).sort({ createdAt: -1 }).limit(limit)

    return res.json({
        success: true,
        count: orders.length,
        orders,
    })
})

const ALLOWED_STATUSES = ['accepted', 'preparing', 'ready_for_rider'] as const;

export const updateOrderStatus = TryCatch(async (req: AuthenticatedRequest, res) => {
    const user = req.user;
    const { orderId } = req.params;
    const { status } = req.body;

    if (!ALLOWED_STATUSES.includes(status)) {
        return res.status(400).json({
            message: 'Invalid order status'
        })
    }

    const order = await Order.findById(orderId);
    if (!order) {
        return res
            .status(400)
            .json({
                message: "Order not found"
            })
    }

    if (order.paymentStatus !== "paid") {
        return res
            .status(404)
            .json({
                message: "Order not completed"
            })
    }

    const restaurant = await Restaurant.findById(order.restaurantId)

    if (!restaurant) {
        return res
            .status(404)
            .json({
                message: "Restaurant not found",
            })
    }

    if (restaurant.ownerId !== user?._id.toString()) {
        return res
            .status(401)
            .json({
                message: "Since you are not owner of this Restaurant, you can't update the order",
            })
    }

    order.status = status;
    await order.save();

    await axios.post(`${process.env.REALTIME_SERVICE}/api/v1/internal/emit`,
        {
            event: "order:update",
            room: `user:${order.userId}`,
            payload: {
                orderId: order._id,
                status: order.status,
            }
        }, {
        headers: {
            "x-internal-key": process.env.INTERNAL_SERVICE_KEY,
        }
    })
    // now assign riders
    if (status === 'ready_for_rider') {
        console.log('Publishing Order for rider event for order', order._id);

        await publishEvent('ORDER_READY_FOR_RIDER', {
            orderId: order._id.toString(),
            restaurantId: restaurant._id.toString(),
            location: restaurant.autoLocation,
        })

        console.log('Event publish successfully')
    }



    res.json({
        message: "order status updated successfully",
        order,
    })
})

export const getMyOrders = TryCatch(async (req: AuthenticatedRequest, res) => {
    const user = req.user;
    if (!user) {
        return res
            .status(401)
            .json({
                message: "Unauthorized"
            })
    }

    const orders = await Order.find({
        userId: user._id.toString(),
        paymentStatus: 'paid',
    }).sort({ createdAt: -1 })

    res.json({
        success: true,
        message: "Order fetched successfully",
        orders,
    })
})


export const fetchSingleOrder = TryCatch(async (req: AuthenticatedRequest, res) => {
    const user = req.user;
    if (!user) {
        return res
            .status(401)
            .json({
                message: "Unauthorized"
            })
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
        return res
            .status(404)
            .json({
                message: 'Order not found'
            })
    }

    if (order.userId !== user._id.toString()) {
        return res
            .status(401)
            .json({
                message: "You are not allowed to view this order"
            })
    }

    return res.json({
        success: true,
        order,
    })
})

export const assignOrderToRider = TryCatch(async (req, res) => {
    if (req.headers['x-internal-key'] !== process.env.INTERNAL_SERVICE_KEY) {
        return res.status(403).json({ message: 'Forbidden' })
    }

    const { orderId, riderId, riderName, riderPhone } = req.body;

    const orderAvailable = await Order.findOne({riderId, status: {$ne: 'delivered'}});

    if(orderAvailable){
        return res.status(400)
        .json({
            message: "You already have an Order"
        })
    }

    const order = await Order.findById(orderId);

    if (order?.riderId !== null) {
        return res.status(400).json({ message: 'Order already taken' })
    }

    const orderUpdated = await Order.findOneAndUpdate({ _id: orderId, riderId: null }, {
        riderId,
        riderName,
        riderPhone,
        status: 'rider_assigned',
    }, { new: true });

    await axios.post(`${process.env.REALTIME_SERVICE}/api/v1/internal/emit`,
        {
            event: 'order:rider_assigned',
            room: `user:${order.userId}`,
            payload: order,
        }, {
        headers: {
            'x-internal-key': process.env.INTERNAL_SERVICE_KEY,
        }
    }
    )

    await axios.post(`${process.env.REALTIME_SERVICE}/api/v1/internal/emit`,
        {
            event: 'order:rider_assigned',
            room: `restaurant:${order.restaurantId}`,
            payload: order,
        }, {
        headers: {
            'x-internal-key': process.env.INTERNAL_SERVICE_KEY,
        }
    }
    )

    res.json({
        message: 'Rider Assigned successfully',
        success: true,
        order: orderUpdated
    })
})

export const getCurrentOrdersForRider = TryCatch(async (req, res) => {
    if (req.headers['x-internal-key'] !== process.env.INTERNAL_SERVICE_KEY) {
        return res.status(403).json({ message: 'Forbidden' })
    }

    const { riderId } = req.query;

    if (!riderId) {
        return res.status(400).json({ message: 'Rider Id is required' })
    }

    const order = await Order.findOne({
        riderId,
        status: { $ne: 'delivered' }
    }).populate("restaurantId");

    if (!order) {
        return res.status(404).json({ message: 'Order not found' })
    }

    res.json({
        order,
    })
})


export const updateOrderStatusByRider = TryCatch(async (req, res) => {
    if (req.headers['x-internal-key'] !== process.env.INTERNAL_SERVICE_KEY) {
        return res.status(403).json({ message: 'Forbidden' })
    }

    const { orderId } = req.body;
    if (!orderId) {
        return res.status(400).json({ message: 'Order Id is required' })
    }

    const order = await Order.findById(orderId)

    if (!order) {
        return res.status(404).json({ message: 'Order not found' })
    }

    if (order.status === 'rider_assigned') {
        order.status = 'picked_up';


        await order.save()

        await axios.post(`${process.env.REALTIME_SERVICE}/api/v1/internal/emit`, {
            event: 'order:rider_assigned',
            room: `restaurant:${order.restaurantId}`,
            payload: order,
        }, {
            headers: { 'x-internal-key': process.env.INTERNAL_SERVICE_KEY }
        })


        await axios.post(`${process.env.REALTIME_SERVICE}/api/v1/internal/emit`, {
            event: 'order:rider_assigned',
            room: `user:${order.userId}`,
            payload: order,
        }, {
            headers: { 'x-internal-key': process.env.INTERNAL_SERVICE_KEY }
        })

        return res.json({
            message: 'Order updated successfully',

        })
    }

    if (order.status === 'picked_up') {
         order.status = 'delivered';


        await order.save()

        await axios.post(`${process.env.REALTIME_SERVICE}/api/v1/internal/emit`, {
            event: 'order:rider_assigned',
            room: `restaurant:${order.restaurantId}`,
            payload: order,
        }, {
            headers: { 'x-internal-key': process.env.INTERNAL_SERVICE_KEY }
        })


        await axios.post(`${process.env.REALTIME_SERVICE}/api/v1/internal/emit`, {
            event: 'order:rider_assigned',
            room: `user:${order.userId}`,
            payload: order,
        }, {
            headers: { 'x-internal-key': process.env.INTERNAL_SERVICE_KEY }
        })

        return res.json({
            message: 'Order updated successfully',

        })
    }
})