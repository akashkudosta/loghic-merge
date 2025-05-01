import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

mongoose.set('strictQuery', true);

export const dbConnect = () => {
  mongoose.connection.once("open", () => console.log("MongoDB connected successfully"));
  return mongoose.connect(
    process.env.DB_LINK,
    { useNewUrlParser: true, useUnifiedTopology: true }
  );
};
