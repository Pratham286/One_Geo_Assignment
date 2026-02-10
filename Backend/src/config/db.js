import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    // console.log(`${process.env.MongoDB_URL}`);
    const connectionInstance = await mongoose.connect(`${process.env.MongoDB_URL}`);
    console.log(`MongoDB connected at ${connectionInstance.connection.host}`);
  } catch (error) {
    console.error("Error on connecting MongoDB: ", error);
    process.exit(1) // Provided by Node
  }
};