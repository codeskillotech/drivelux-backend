const mongoose = require("mongoose");

const carSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },     // "Range Rover Sport"
    brand: { type: String, trim: true },

    category: {
      type: String,
      enum: ["SUV", "Sedan", "Luxury", "Electric"],
      required: true,
    },

    pricePerDay: { type: Number, required: true },

    transmission: {
      type: String,
      enum: ["Automatic", "Manual"],
      default: "Automatic",
    },

    fuelType: {
      type: String,
      enum: ["Petrol", "Diesel", "Electric", "Hybrid"],
      required: true,
    },

    seats: { type: Number, default: 5 },

    rating: { type: Number, default: 4.5 },
    reviewsCount: { type: Number, default: 0 },

    // ✅ Admin will directly provide image link
    imageUrl: { type: String, required: true, trim: true },

    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Car", carSchema);

