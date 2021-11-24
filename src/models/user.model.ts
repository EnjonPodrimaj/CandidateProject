import mongoose from "mongoose";
import bcrypt from "bcrypt";
import config from "config";

export interface UserDocument extends mongoose.Document {
    first_name: string;
    last_name: string;
    password: string;
    full_name: string;
    email: string;
    phone: string;
    no_of_likes: number;
    comparePassword(candidatePass: string): Promise<Boolean>;
}

const UserSchema = new mongoose.Schema(
    {
        first_name: {
            type: String,
            required: true,
        },
        last_name: {
            type: String,
            required: true,
        },
        password: {
            type: String,
            required: true,
        },
        no_of_likes: {
            type: Number,
            default: 0,
        },
        full_name: String,
        email: String,
        phone: String,
    },
    {
        timestamps: true,
    }
);

UserSchema.pre("save", async function (next: any) {
    const user = this as UserDocument;

    if (!user.isModified("password")) {
        return next();
    }

    const salt = await bcrypt.genSalt(config.get<number>("saltWorkFactor"));
    const hash = await bcrypt.hash(user.password, salt);

    user.password = hash;

    return next();
});


UserSchema.methods.comparePassword = async function (candidatePass: string): Promise<Boolean> {
    const user = this as UserDocument;

    return bcrypt.compare(candidatePass, user.password).catch(e => false);
}

const UserModel = mongoose.model<UserDocument>('user', UserSchema);

export default UserModel;