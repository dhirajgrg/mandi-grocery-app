import { Schema, model } from "mongoose";

const orderSchema = new Schema(
  {
    orderNumber: {
      type: String,
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

    orderType: {
      type: String,
      enum: ["delivery", "takeaway"],
      default: "delivery",
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

    deletedByUser: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

// Generate daily order number: YYYYMMDD-NNN (resets each day)
orderSchema.pre("save", async function () {
  if (this.isNew && !this.orderNumber) {
    const now = new Date();
    const datePrefix =
      String(now.getFullYear()) +
      String(now.getMonth() + 1).padStart(2, "0") +
      String(now.getDate()).padStart(2, "0");

    const todayStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );
    const todayEnd = new Date(todayStart);
    todayEnd.setDate(todayEnd.getDate() + 1);

    const lastTodayOrder = await this.constructor
      .findOne(
        { orderNumber: { $regex: `^${datePrefix}-` } },
        { orderNumber: 1 },
        { sort: { orderNumber: -1 } },
      )
      .lean();

    let seq = 1;
    if (lastTodayOrder) {
      const lastSeq = parseInt(lastTodayOrder.orderNumber.split("-")[1], 10);
      seq = lastSeq + 1;
    }

    this.orderNumber = `${datePrefix}-${String(seq).padStart(3, "0")}`;
  }
});

const Order = model("order", orderSchema);

export default Order;
