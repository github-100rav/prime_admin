"use server";
import { dbConnect } from "@/lib/dbConnect";
import { orderTemplate } from "@/lib/mailTemplates";
import sendMail from "@/lib/sendMail";
import { Order } from "@/model/Order";
export const getOrders = async (
  statusFilter?: string,
  page = 1,
  limit = 10
) => {
  try {
    await dbConnect();

    const matchStage =
      statusFilter && statusFilter !== "all"
        ? { $match: { status: statusFilter } }
        : { $match: {} };

    const aggregationPipeline: any = [
      matchStage,
      { $skip: (page - 1) * limit },
      { $limit: limit },
      {
        $lookup: {
          from: "darkusers",
          localField: "ownerId",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "products",
          localField: "products.productId",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      {
        $addFields: {
          products: {
            $map: {
              input: "$products",
              as: "product",
              in: {
                quantity: "$$product.quantity",
                product: {
                  $arrayElemAt: [
                    {
                      $filter: {
                        input: "$productDetails",
                        as: "detail",
                        cond: { $eq: ["$$detail._id", "$$product.productId"] },
                      },
                    },
                    0,
                  ],
                },
              },
            },
          },
        },
      },
      {
        $project: {
          transactionId: 1,
          status: 1,
          paymentStatus: 1,
          paymentMethod: 1,
          totalAmount: 1,
          orderEmail: 1,
          credentials: 1,
          comment: 1, // Add this line to include the comment
          createdAt: 1,
          updatedAt: 1,
          user: {
            _id: "$user._id",
            name: "$user.name",
            email: "$user.email",
          },
          products: {
            $map: {
              input: "$products",
              as: "p",
              in: {
                quantity: "$$p.quantity",
                product: {
                  _id: "$$p.product._id",
                  title: "$$p.product.title",
                  price: "$$p.product.price",
                  logoImage: "$$p.product.logoImage",
                },
              },
            },
          },
        },
      },
      { $sort: { createdAt: -1 } },
    ];

    const orders = await Order.aggregate(aggregationPipeline);
    const totalCount = await Order.countDocuments(matchStage.$match);

    if (!orders.length) {
      return {
        orders: "[]",
        success: true,
        message: "No orders found",
        totalCount: 0,
        totalPages: 0,
        currentPage: page,
      };
    }

    return {
      orders: JSON.stringify(orders),
      success: true,
      message: "Successfully retrieved orders",
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
    };
  } catch (error: any) {
    console.error("Order fetch error:", error);
    return {
      success: false,
      message: error.message || "Failed to fetch orders",
      orders: "[]",
      totalCount: 0,
    };
  }
};

export const changeStatus = async (_id: string, status: string) => {
  try {
    await dbConnect();
    if (!_id) {
      return {
        message: "order is not found",
        success: false,
      };
    }

    const order: any = Order.findById(_id);

    if (!order) {
      return {
        message: "order is not found",
        success: false,
      };
    }

    order.status = status;
    await order.save();

    return {
      message: "order status is succussfuly changed",
      success: true,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "internal error",
    };
  }
};

export const deliverOrder = async (
  orderEmail: string,
  credentials: {
    product: string;
    email: string;
    password: string;
    message?: string;
    status: "processing" | "delivered" | "cancelled";
  }[],
  orderId: string
) => {
  try {
    await dbConnect();
    const order = await Order.findById(orderId);

    if (!order) {
      return {
        success: false,
        message: "Order not found",
      };
    }

    order.orderEmail = orderEmail;
    order.credentials = credentials;

    // Set overall order status based on individual credential statuses
    if (credentials.every((cred) => cred.status === "delivered")) {
      order.status = "delivered";
    } else if (credentials.some((cred) => cred.status === "cancelled")) {
      order.status = "cancelled";
    } else {
      order.status = "processing";
    }

    await order.save();

    // Send email notification
    const orderHtml = orderTemplate(order,credentials.map(cred => cred.message || "").join("\n"));
    await sendMail(orderEmail, "Your Order from Primeflix", orderHtml);

    return {
      message: "Order updated successfully",
      success: true,
      data: {
        orderId: order._id.toString(), // Convert ObjectId to string
        status: order.status,
      },
    };
  } catch (error: any) {
    console.error("Order delivery error:", error);
    return {
      success: false,
      message: error.message || "Internal server error",
    };
  }
};