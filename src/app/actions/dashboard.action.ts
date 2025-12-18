"use server";
import { DarkUser } from "@/model/User";
import { dbConnect } from "@/lib/dbConnect";
import { Order } from "@/model/Order";

interface TimeSeriesPoint {
  name: string;
  revenue: number;
  orders: number;
  date?: string;
}
export const getDashboardData = async () => {
  try {
    await dbConnect();

    // 1. Get basic counts and totals
    const [revenueResult, totalOrders, totalUsers, productsSoldResult] =
      await Promise.all([
        Order.aggregate([
          { $match: { status: "delivered" } },
          { $group: { _id: null, total: { $sum: "$totalAmount" } } },
        ]),
        Order.countDocuments(),
        DarkUser.countDocuments(),
        Order.aggregate([
          { $unwind: "$products" },
          { $group: { _id: null, total: { $sum: "$products.quantity" } } },
        ]),
      ]);

    const totalRevenue = revenueResult[0]?.total || 0;
    const productsSold = productsSoldResult[0]?.total || 0;

    // 2. Get recent orders with aggregation
    const recentOrders = await Order.aggregate([
      { $sort: { createdAt: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "darkusers",
          localField: "ownerId",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $project: {
          orderId: { $toString: "$_id" },
          customer: "$user.name",
          firstProduct: { $arrayElemAt: ["$products", 0] },
          totalAmount: 1,
          status: 1,
          date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        },
      },
      {
        $lookup: {
          from: "products",
          localField: "firstProduct.productId",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: { path: "$product", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          id: { $substr: ["$orderId", 20, 5] },
          customer: 1,
          product: { $ifNull: ["$product.title", "Multiple Products"] },
          amount: "$totalAmount",
          status: 1,
          date: 1,
        },
      },
    ]);

    // 3. Get top selling products
    const topProducts = await Order.aggregate([
      { $unwind: "$products" },
      {
        $group: {
          _id: "$products.productId",
          totalSold: { $sum: "$products.quantity" },
          totalRevenue: {
            $sum: "$totalAmount" 
          },
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" },
      {
        $project: {
          name: "$product.title",
          sales: "$totalSold",
          revenue: "$totalRevenue",
        },
      },
    ]);

    // 4. Get sales by category
    const salesByCategory = await Order.aggregate([
      { $unwind: "$products" },
      {
        $lookup: {
          from: "products",
          localField: "products.productId",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" },
      {
        $group: {
          _id: "$product.category",
          value: { $sum: "$products.quantity" },
        },
      },
      {
        $project: {
          name: "$_id",
          value: 1,
          _id: 0,
        },
      },
    ]);

    // Format the data for client
    const data = {
      totalRevenue,
      totalOrders,
      totalUsers,
      productsSold,
      recentOrders: recentOrders.map((o) => ({
        ...o,
        id: `ORD-${o.id.toUpperCase()}`,
        amount: `₹${o.amount.toLocaleString("en-IN")}`,
      })),
      topProducts: topProducts.map((p) => ({
        ...p,
        revenue: `₹${p.revenue.toLocaleString("en-IN")}`,
      })),
      salesByCategory,
      performanceMetrics: [
        { name: "Conversion Rate", value: "3.2%", change: "+0.5%" },
        {
          name: "Avg. Order Value",
          value: `₹${(totalRevenue / (totalOrders || 1)).toFixed(2)}`,
          change: "+12%",
        },
        { name: "Customer Retention", value: "42%", change: "+7%" },
        { name: "Cart Abandonment", value: "68%", change: "-3%" },
      ],
      chartData: {
        monthly: await getMonthlyDistribution(), // Changed from generateTimeSeriesData
        weekly: await getWeeklyDistribution()  // Changed from generateTimeSeriesData
      },
    };

    return {
      data: JSON.stringify(data),
      success: true,
    };
  } catch (error: any) {
    console.error("Dashboard data error:", error);
    return {
      message: error.message || "Failed to fetch dashboard data",
      success: false,
    };
  }
};

async function getWeeklyDistribution(): Promise<TimeSeriesPoint[]> {
  try {
    const weeklyData = await Order.aggregate([
      { $match: { status: "delivered" } },
      {
        $group: {
          _id: { $dayOfWeek: "$createdAt" }, // 1=Sunday, 7=Saturday
          totalSales: { $sum: "$totalAmount" },
          orderCount: { $sum: 1 }
        }
      },
      {
        $project: {
          dayOfWeek: "$_id",
          revenue: "$totalSales",
          orders: "$orderCount",
          _id: 0
        }
      }
    ]);

    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return Array.from({ length: 7 }, (_, i) => {
      const found = weeklyData.find(d => d.dayOfWeek === i + 1);
      return {
        name: days[i],
        revenue: found?.revenue || 0,
        orders: found?.orders || 0
      };
    });
  } catch (error) {
    console.error("Error generating weekly distribution:", error);
    return [];
  }
}

async function getMonthlyDistribution(): Promise<TimeSeriesPoint[]> {
  try {
    const monthlyData = await Order.aggregate([
      { $match: { status: "delivered" } },
      {
        $group: {
          _id: { $month: "$createdAt" }, // 1=January, 12=December
          totalSales: { $sum: "$totalAmount" },
          orderCount: { $sum: 1 }
        }
      },
      {
        $project: {
          month: "$_id",
          revenue: "$totalSales",
          orders: "$orderCount",
          _id: 0
        }
      }
    ]);

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", 
                   "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return Array.from({ length: 12 }, (_, i) => {
      const found = monthlyData.find(d => d.month === i + 1);
      return {
        name: months[i],
        revenue: found?.revenue || 0,
        orders: found?.orders || 0
      };
    });
  } catch (error) {
    console.error("Error generating monthly distribution:", error);
    return [];
  }
}

