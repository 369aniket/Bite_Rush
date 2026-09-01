import mongoose, {Schema, Document} from "mongoose";

export interface IMenu extends Document {
    restaurantId: mongoose.Types.ObjectId;
    name: string;
    description: string;
    image?: string;
    price: number;
    isAvailable: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const menuSchema = new Schema<IMenu>({
    restaurantId:{
        type: Schema.Types.ObjectId,
        ref:"Restaurant",
        required:true,
        index:true,
    },
    name:{
        type:String,
        trim:true,
        required:true,
    },
     description:{
        type:String,
        trim:true,
    },
     price:{
        type:Number,
        required:true,
    },
     image:{
        type:String,
        required:true,
    },
     isAvailable:{
        type:Boolean,
        default:true,
    },

}, {timestamps:true});

const MenuItem =  mongoose.model<IMenu>("MenuItem", menuSchema);
export default MenuItem;