import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const deleteImageFromCloudinary = async (
  publicId: string
): Promise<boolean> => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    if (result.result === "ok") {
      console.log(`Successfully deleted image with public_id: ${publicId}`);
      return true;
    } else {
      console.error("Failed to delete image:", result);
      return false;
    }
  } catch (error) {
    console.error("Error deleting image:", error);
    return false;
  }
};
