"use server";
import { dbConnect } from "@/lib/dbConnect";
import { Category } from "@/model/Category";
import { Product } from "@/model/Product";
const newCategory = async (data: { title: string }) => {
  await dbConnect();

  try {
    const { title } = data;

    if (!title || title.trim() === "") {
      return {
        success: false,
        message: "Please provide a valid category title",
        status: 400,
      };
    }

    const normalizedTitle = title.trim().toLowerCase();
    const isExist = await Category.findOne({
      title: { $regex: new RegExp(`^${normalizedTitle}$`, "i") },
    });

    if (isExist) {
      return {
        success: false,
        message: "Category already exists",
        status: 409,
      };
    }

    const category = await Category.create({ title: title.trim() });

    if (!category) {
      return {
        success: false,
        message: "Failed to create category, please try again",
        status: 500,
      };
    }

    return {
      success: true,
      message: "Category created successfully",
      status: 201,
      data: category,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Server error while creating category",
      status: 500,
    };
  }
};

const getCategory = async () => {
  try {
    await dbConnect();
    const categories = await Category.find({});
    return {
      success: true,
      message: "successfuly got Category",
      categories: JSON.stringify(categories),
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Failed to get categories please try again",
      status: 500,
    };
  }
};

const deleteCategory = async (_id: string) => {
  try {
    await dbConnect();
    if (!_id) {
      return {
        success: false,
        message: "categories is not found",
      };
    }
    await Category.findByIdAndDelete(_id);
    return {
      success: true,
      message: "successfuly Deleted ",
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Failed to get categories please try again",
      status: 500,
    };
  }
};

const updateCategory = async (_id: string, data: any) => {
  try {
    await dbConnect();
    
    if (!_id) {
      return {
        success: false,
        message: "Category ID is required",
      };
    }

    const category = await Category.findById(_id);
    if (!category) {
      return {
        success: false,
        message: "Category not found",
      };
    }

    const oldTitle = category.title;
    let newTitle = category.title;

    if (data.title) {
      newTitle = data.title;
      category.title = newTitle;
    }

    // Only update products if the title changed
    if (oldTitle !== newTitle) {
      // Use bulk update for better performance
      await Product.updateMany(
        { category: oldTitle },
        { $set: { category: newTitle } }
      );
    }

    await category.save();

    return {
      success: true,
      message: `Successfully updated ${newTitle}`,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Failed to update category, please try again",
      status: 500,
    };
  }
};

export { newCategory, getCategory, deleteCategory, updateCategory };
