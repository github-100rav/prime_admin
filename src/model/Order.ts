import mongoose, { Schema, model, models } from "mongoose";
interface IOrderItem {
  productId: mongoose.Types.ObjectId;
  quantity: number;
}
interface IOrder {
  products: IOrderItem[];
  totalAmount: number;
  status: "processing" | "delivered" | "cancelled";
  paymentStatus: "processing" | "paid" | "failed";
  paymentMethod: string;
  transactionId?: string;
  orderEmail?: string;
  credentials?: Array<{
    product: string;
    email: string;
    password: string;
    text: string;
  }>;
  createdAt?: Date;
  updatedAt?: Date;
  ownerId: mongoose.Types.ObjectId;
  comment:string;
}

const orderSchema = new Schema<IOrder>(
  {
    products: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: { type: Number, required: true, min: 1 },
      },
    ],
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "Darkuser",
      required: true,
    },
    totalAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["processing", "delivered", "cancelled"],
      default: "processing",
    },
    paymentStatus: {
      type: String,
      enum: ["processing", "paid", "failed"],
      default: "processing",
    },
    paymentMethod: { type: String },
    orderEmail: String,
    transactionId: {
      type:String,
      required:[true,"transcation id is not found"],
      unique:[true,"please check your payment details"]
    },
    credentials: [
      {
        product: String,
        email: String,
        password: String,
        text: String,
      },
      
    ],
    comment:String
  },
  { timestamps: true }
);

export const Order = models?.Order || model<IOrder>("Order", orderSchema);
