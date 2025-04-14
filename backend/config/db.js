import mongoose from "mongoose";

export const connectDB = async () => {
    await  mongoose.connect('mongodb+srv://greatstack:moin__6646__1303@cluster0.ghupxej.mongodb.net/food-del?').then(()=>console.log("DB Connected"));
}