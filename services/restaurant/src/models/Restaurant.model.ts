import mongoose, {Schema, Document} from "mongoose";

export interface IRestaurant extends Document{
    name: string;
    description?: string;
    image: string;
    ownerId: string;
    phone: number;
    isVarified: boolean;
    restaurantId: string;

    autoLocation: {
        type: "Point",
        coordinates:[number, number] // longitude latitude
        formatedAddress: string;
    };
    isOpen: boolean;
    createdAt: Date;
}

const RestaurantSchema = new Schema<IRestaurant>({
    name:{
        type:String,
        required: true,
        trim: true,
    },
    description:{
        type: String,
    },
    image:{
        type: String,
        required: true,
    },
    ownerId:{
        type: String,
        required: true,
    },
    phone:{
        type: Number,
        required:true,
    },
    isVarified:{
        type: Boolean,
        required: true,
    },
    restaurantId: {
        type: String,
    },

    autoLocation:{
        type: {
            type: String,
            enum:["Point"],
            required: true,
        },
        coordinates:{
            type:[Number],
            required:true,
        },
        formatedAddress:{
            type:String,
        }
    },
    isOpen:{
        type: Boolean,
        default: false,
    }
}, {timestamps: true})

// To get index for nearby search

RestaurantSchema.index({autoLocation:"2dsphere"})


const Restaurant = mongoose.model<IRestaurant>("Restaurant", RestaurantSchema)

export default Restaurant;