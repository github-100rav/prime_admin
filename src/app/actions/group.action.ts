"use server";
import getImageUrl from "@/lib/cloudinary/GetImageUrl";
import UploadImageOnCloudinary from "@/lib/cloudinary/UploadImage";
import { dbConnect } from "@/lib/dbConnect";
import { Group } from "@/model/Group";
const newGroup = async (data: {
  title: string;
  logoImage: any;
  slug: string;
}) => {
  await dbConnect();
  try {
    let ImageUrl;
    const { title, logoImage, slug } = data;
    if (!title || !logoImage) {
      return {
        success: false,
        message: "Please fill the all fields",
        status: 400,
      };
    }
    const groupName = "groups";
    const uploadResult = await UploadImageOnCloudinary(logoImage, groupName);
    if (typeof uploadResult === "string") {
      const productImagePublicId = uploadResult;
      ImageUrl = getImageUrl(productImagePublicId);
    }

    const group = await Group.create({
      title,
      logoImage: ImageUrl,
      slug: slug.toLocaleLowerCase(),
    });

    if (!group) {
      return {
        success: false,
        message: "Failed to create groups please try again",
        status: 400,
      };
    }

    return {
      success: true,
      message: "Successfuly created",
      status: 201,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Failed to create groups please try again",
      status: 500,
    };
  }
};

const getGroup = async () => {
  try {
    await dbConnect();
    const groups = await Group.find({});
    return {
      success: true,
      message: "successfuly got group",
      groups: JSON.stringify(groups),
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Failed to get groups please try again",
      status: 500,
    };
  }
};

const deleteGroup = async (_id: string) => {
  try {
    await dbConnect();
    if (!_id) {
      return {
        success: false,
        message: "groups is not found",
      };
    }
    await Group.findByIdAndDelete(_id);
    return {
      success: true,
      message: "successfuly Deleted ",
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Failed to get groups please try again",
      status: 500,
    };
  }
};

const updateGroup = async (_id: string, data: any) => {
  try {
    await dbConnect();
    if (!_id) {
      return {
        success: false,
        message: "groups is not found",
      };
    }

    const group = await Group.findById(_id);
    if (!group) {
      return {
        success: false,
        message: "groups is not found",
      };
    }
    if (data.slug) {
      group.slug = data.slug;
    }

    if (data.title) {
      group.title = data.title;
    }

    if (data.status) {
      group.status = data.status;
    }

    if (data.logoImage && typeof data.logoImage !== "string") {
      const uploadResult = await UploadImageOnCloudinary(
        data.logoImage,
        "groups"
      );
      if (typeof uploadResult === "string") {
        const productImagePublicId = uploadResult;
        const ImageUrl = getImageUrl(productImagePublicId);
        group.logoImage = ImageUrl;
      }
    }

    await group.save();

    return {
      success: true,
      message: `successfuly updated ${data.title}`,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Failed to update groups please try again",
      status: 500,
    };
  }
};

export { newGroup, getGroup, deleteGroup, updateGroup };
