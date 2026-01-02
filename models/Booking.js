const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    car: { type: mongoose.Schema.Types.ObjectId, ref: "Car", required: true },

    pickupLocation: { type: String, required: true, trim: true },

    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },

    pricePerDay: { type: Number, required: true },
    days: { type: Number, required: true },

    subTotal: { type: Number, required: true },
    taxRate: { type: Number, default: 0.1 },
    taxAmount: { type: Number, required: true },
    totalAmount: { type: Number, required: true },

    status: {
      type: String,
      enum: ["PENDING", "CONFIRMED", "CANCELLED"],
      default: "CONFIRMED"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", bookingSchema);
