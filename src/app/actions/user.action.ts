"use server";
import { dbConnect } from "@/lib/dbConnect";
import { DarkUser } from "@/model/User";
import { Order } from "@/model/Order";

export const getUsers = async () => {
  try {
    await dbConnect();

    const result = await DarkUser.aggregate([
      {
        $lookup: {
          from: "orders",
          localField: "_id",
          foreignField: "userId",
          as: "orders",
        },
      },
      {
        $addFields: {
          totalSpend: { $sum: "$orders.totalAmount" },
        },
      },
      {
        $project: {
          name: 1,
          email: 1,
          image: 1,
          totalSpend: 1,
          createdAt: 1,
          provider:1,
          orderCount: { $size: "$orders" },
        },
      },
    ]);

    const totalUsers = result.length;
    const totalSpend = result.reduce((acc, user) => acc + (user.totalSpend || 0), 0);

    return {
      users: JSON.stringify(result),
      totalUsers,
      totalSpend,
      success: true,
      message: "Users and spend stats fetched successfully",
    };
  } catch (error: any) {
    console.error("User fetch error:", error);
    return {
      message: error.message || "Internal server error",
      success: false,
    };
  }
};


export const deleteUser = async()=>{
  try {
    
  } catch (error:any) {
    console.error("User fetch error:", error);
    return {
      message: error.message || "Internal server error",
      success: false,
    };
  }
}