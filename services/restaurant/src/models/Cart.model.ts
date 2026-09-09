import mongoose, {Schema, Document} from "mongoose";
interface ICart extends Document {
    userId: mongoose.Types.ObjectId;
    restaurantId: mongoose.Types.ObjectId;
    itemId: mongoose.Types.ObjectId;
    quantity: number;
    createdAt: Date;
    updatedAt: Date;
}

const cartSchema = new Schema<ICart>({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index:true,
    },
    restaurantId: {
        type: Schema.Types.ObjectId,
        ref:"Restaurant",
        required: true,
        index: true,
    },
    itemId: {
        type: Schema.Types.ObjectId,
        ref: 'MenuItem',
        required:true,
        index: true,
    },
    quantity: {
        type: Number,
        default: 1,
        min: 1,
    }
},{timestamps: true})

cartSchema.index({userId: 1, restaurantId: 1, itemId: 1}, {unique: true})

const Cart = mongoose.model<ICart>("Cart", cartSchema)

export default Cart;