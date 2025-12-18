"use server";
import getImageUrl from "@/lib/cloudinary/GetImageUrl";
import UploadImageOnCloudinary from "@/lib/cloudinary/UploadImage";
import { uploadLogo } from "@/lib/cloudinary/UploadLogo";
import { dbConnect } from "@/lib/dbConnect";
import { Product } from "@/model/Product";
import mongoose from "mongoose";


export async function addProduct(data: any) {
  try {
    await dbConnect();
    const {
      title,
      group,
      category,
      stock,
      description,
      price,
      originalPrice,
      logoImage,
      features,
    } = data;
    if (
      !title ||
      !stock ||
      !description ||
      !price ||
      !originalPrice ||
      !logoImage ||
      !features
    ) {
      return {
        success: false,
        message: "Please fill the all fields",
        status: 400,
      };
    }
    let productImagePublicId = "";
    let productLogoPublicId = "";
    let productLogoUrl = "";
    const imageData = [];
    if (data.images) {
      for (let i = 0; i < data.images.length; i++) {
        const uploadResult = await UploadImageOnCloudinary(
          data.images[i],
          data.category
        );
        if (typeof uploadResult === "string") {
          productImagePublicId = uploadResult;
          const ImageUrl = getImageUrl(productImagePublicId);
          imageData.push(ImageUrl);
        }
      }
    }

    if (data.logoImage) {
      const uploadResult = await uploadLogo(data.logoImage, data.category);
      if (typeof uploadResult === "string") {
        productLogoPublicId = uploadResult;
        productLogoUrl = getImageUrl(productLogoPublicId);
      }
    }

    const dicountPrice = originalPrice - price;
    const dicountPer = Math.floor((dicountPrice / originalPrice) * 100);
    const product = await Product.create({
      title,
      description,
      price,
      group,
      discount: dicountPer,
      category,
      stock,
      originalPrice,
      logoImage: productLogoUrl,
      features:features.split("\n"),
      images: imageData,
    });
    if (!product) {
      return {
        success: false,
        message: "Could not add product",
        status: 400,
      };
    }
    return {
      success: true,
      message: "Product added successfully",
      status: 200,
    };
  } catch (error: any) {
    console.error("Error in addProduct:", error);
    return {
      success: false,
      message: "Server Error while adding product",
      status: 500,
    };
  }
}
export async function getProduct() {
  try {
    await dbConnect();

    const products = await Product.find().lean();

    if (!products || products.length === 0) {
      return {
        success: false,
        message: "Could not find products",
        status: 400,
        data: [],
      };
    }

    const formattedProducts = products.map((product) => ({
      id: (product._id as mongoose.Types.ObjectId).toString(),
      title: product.title,
      description: product.description,
      price: product.price,
      discount: product.discount,
      category: product.category,
      group: product.group,
      stock: product.stock,
      originalPrice: product.originalPrice,
      logoImage: product.logoImage,
      features: product.features,
      images: product.images,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    }));

    return {
      data: formattedProducts,
      success: true,
      message: "Products fetched successfully",
      status: 200,
    };
  } catch (error: any) {
    console.error("Error in getProduct:", error);
    return {
      success: false,
      message: "Server Error while fetching products",
      status: 500,
      data: [],
    };
  }
}

export const deleteProduct = async (id: string) => {
  try {
    await dbConnect();
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return {
        success: false,
        message: "Invalid Product ID",
        status: 400,
      };
    }

    const findProduct = await Product.findById(id);

    if (!findProduct) {
      return {
        success: false,
        message: "Could not find the Product",
        status: 404,
      };
    }
    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
      return {
        success: false,
        message: "Product could not be deleted",
        status: 400,
      };
    }

    return {
      success: true,
      message: "Product Deleted Successfully",
      status: 200,
    };
  } catch (error: any) {
    console.error("Error deleting product:", error);
    return {
      success: false,
      message: "Server Error In Deleting The Product",
      status: 500,
    };
  }
};
export const updateProduct = async (formData: any, imageData: any) => {
  try {
    await dbConnect();
    const _id = formData.get("_id");
    const title = formData.get("title");
    const category = formData.get("category");
    const group = formData.get("group");
    const stock = formData.get("stock");
    const description = formData.get("description");
    const price = formData.get("price");
    const originalPrice = formData.get("originalPrice");
    const logoImage = formData.get("logoImage");
    const features = formData.get("features");
    const product = await Product.findById(_id);
    if (!product) {
      return {
        success: false,
        message: "Product is not found",
        status: 400,
      };
    }
    if (title) {
      product.title = title;
    }
    if (category) {
      product.category = category;
    }

    if (group) {
      product.group = group;
    }
    if (stock) {
      product.stock = stock;
    }
    if (description) {
      product.description = description;
    }
    if (price) {
      product.price = price;
    }
    if (originalPrice) {
      product.originalPrice = originalPrice;
    }

    if (features) {
      product.features =features?.split("\n");
    }
    const dicountPrice = originalPrice - price;
    const dicountPer = Math.floor((dicountPrice / originalPrice) * 100);
    product.discount = dicountPer;
    const images:any= [];
    images.push(...imageData.old);
    if (imageData.new && imageData.new.length > 0) {
      for (let i = 0; i < imageData.new.length; i++) {
        if (typeof imageData.new[i] === "string") {
          continue;
        }
        const uploadResult = await UploadImageOnCloudinary(
          imageData.new[i],
          category
        );
        if (typeof uploadResult === "string") {
          const ImageUrl = getImageUrl(uploadResult);

          images.push(ImageUrl);
        }
      }
     
    }
    product.images = images;
    if (logoImage && product.logoImage !== logoImage) {
      
      if (typeof logoImage === "string") {
        return;
      }
      const uploadResult = await uploadLogo(logoImage, category);
      if (typeof uploadResult === "string") {
        const ImageUrl = getImageUrl(uploadResult);

        product.logoImage = ImageUrl;
      }
    }
    await product.save({ validateBeforeSave: false });
    return {
      success: true,
      message: "successfully update",
      status: 200,
    };
  } catch (error: any) {
    console.log(error, "error");
    return {
      success: false,
      message: error.message || "Server Error In updating The Product",
      status: 500,
    };
  }
};

export const productNames = async () => {
  try {
      await dbConnect();
    const names = await Product.find({}).distinct("title");

    return {
      messgae: "successuly got",
      names: JSON.stringify(names),
      success: true,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Server Error In name ",
    };
  }
};
