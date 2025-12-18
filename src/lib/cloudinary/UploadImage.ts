import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";
import { Buffer } from "buffer";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

function sanitizePublicId(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9_\-/]/g, '') // Remove invalid characters
    .replace(/\s+/g, '_'); // Replace spaces with underscores
}

export const UploadImageOnCloudinary = async (
  imageInput: File | File[],
  category: string
): Promise<string | NextResponse> => {
  const image = Array.isArray(imageInput) ? imageInput[0] : imageInput;


  if (!image) {
    return NextResponse.json(
      { error: "No image file provided." },
      { status: 400 }
    );
  }

  if (image.size > 5 * 1024 * 1024) {
    return NextResponse.json(
      { error: "File size too large. Maximum size is 5MB." },
      { status: 400 }
    );
  }

  if (!image.type.startsWith("image/")) {
    return NextResponse.json(
      { error: "Invalid file type. Only images are allowed." },
      { status: 400 }
    );
  }

  try {
    const buffer = Buffer.from(await image.arrayBuffer());
    const cleanCategory = sanitizePublicId(category);
    
    const result = await new Promise<any>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `darkSale/products/${cleanCategory}`,
          resource_type: "image",
          transformation: [{ quality: "auto", fetch_format: "auto" }],
        },
        (error, result) => {
          if (error) {
            console.error("Cloudinary upload error:", error);
            reject(new Error("Image upload failed. Check the error logs."));
          } else if (result) {
            resolve(result);
          } else {
            reject(new Error("Unexpected Cloudinary response."));
          }
        }
      );

      uploadStream.end(buffer);
    });

    // Return the secure URL instead of public_id for consistency with your original version
    return result.secure_url;
    
  } catch (error: any) {
    console.error("Error uploading image:", error);
    return NextResponse.json(
      { error: error.message || "Failed to upload image. Please try again later." },
      { status: 500 }
    );
  }
};

export default UploadImageOnCloudinary;