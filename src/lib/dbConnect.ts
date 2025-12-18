import mongoose from "mongoose";
export const dbConnect = async () => {
  const mongouri = process.env.MONGO_URI;

  if (!mongouri) {
    console.log("Mongodb url is missing");
    return;
  }
  try {
    if (mongoose.connections[0].readyState) {
      console.log("Mongodb is already connected");
      return;
    }
    await mongoose.connect(mongouri);
    console.log(`MongoDB Connected successfully`);
  } catch (error: any) {
    console.log("Error in connecting mongodb",error);
  }
};
