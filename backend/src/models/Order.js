import { Schema, model } from "mongoose";

const orderSchema = new Schema(
  {
    orderNumber: {
      type: Number,
      unique: true,
    },

    userId: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },

    items: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: "product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
        discount: {
          type: Number,
          default: 0,
        },
      },
    ],

    totalAmount: {
      type: Number,
      required: true,
    },

    deliveryLocation: {
      lat: Number,
      lng: Number,
      address: String,
    },

    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "packed",
        "out_for_delivery",
        "delivered",
        "cancelled",
      ],
      default: "pending",
    },

    paymentMethod: {
      type: String,
      enum: ["cod", "esewa"],
      default: "cod",
    },

    paymentStatus: {
      type: String,
      enum: ["unpaid", "paid", "refunded"],
      default: "unpaid",
    },

    transactionId: {
      type: String,
    },
  },
  { timestamps: true },
);

// Auto-increment orderNumber starting from 100
orderSchema.pre("save", async function () {
  if (this.isNew && !this.orderNumber) {
    const lastOrder = await this.constructor
      .findOne({}, { orderNumber: 1 }, { sort: { orderNumber: -1 } })
      .lean();
    this.orderNumber = lastOrder?.orderNumber ? lastOrder.orderNumber + 1 : 100;
  }
});

const Order = model("order", orderSchema);

export default Order;
