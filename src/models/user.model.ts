
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import config from "config";

export interface UserDocument extends mongoose.Document {
    first_name: string;
    last_name: string;
    username: string;
    password: string;
    full_name: string;
    email: string;
    phone: string;
    liked_from: string[];
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
        username: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
        },
        full_name: String,
        email: {
            type: String,
            required: true,
            unique: true,
        },
        phone: String,
        liked_from: []
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

UserSchema.methods.comparePassword = async function (
    candidatePass: string
): Promise<Boolean> {
    const user = this as UserDocument;

    return bcrypt.compare(candidatePass, user.password).catch((e) => false);
};

const UserModel = mongoose.model<UserDocument>("user", UserSchema);

export default UserModel;
