import { v2 as cloudinary } from "cloudinary";

const getImageUrl = (publicId: string): string => {
  const imageUrl = cloudinary.url(publicId, {
    secure: true,
    transformation: [{ quality: "auto", fetch_format: "auto" }],
  });

  return imageUrl;
};

export default getImageUrl;
