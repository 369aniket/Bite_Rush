import mongoose, {Document, Schema} from "mongoose";

export interface IUser extends Document{
    name: string;
    email: string;
    image: string;
    role: string;
    token: string | null;
}

const userSchema: Schema<IUser> = new Schema({
    name: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
    },
    email:{
        type: String,
        required: [true, 'Email address is required'],
        unique: true,
        trim: true,
    },
    image: {
        type: String,
    },
    role: {
        type: String,
        default: null,
    },
    token: {
        type: String,
        default: null,
    },
}, {timestamps: true})

const User = mongoose.model<IUser>("User", userSchema)

export default User;