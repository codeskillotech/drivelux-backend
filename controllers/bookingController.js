const Booking = require("../models/Booking");
const Car = require("../models/Car");

// helpers
const startOfDay = (d) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};

const startOfNextDay = (d) => {
  const x = startOfDay(d);
  x.setDate(x.getDate() + 1);
  return x;
};

// days count: endDate is treated as inclusive "till end date"
// Example: start=2026-01-05, end=2026-01-06 => 2 days
const calcDaysInclusive = (start, end) => {
  const s = startOfDay(start);
  const e = startOfDay(end);
  const diffMs = e - s;
  const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000)) + 1;
  return diffDays;
};

// ✅ POST /api/bookings
exports.createBooking = async (req, res) => {
  try {
    const userId = req.user.id;
    const { carId, pickupLocation, startDate, endDate } = req.body;

    if (!carId || !pickupLocation || !startDate || !endDate) {
      return res.status(400).json({
        message: "carId, pickupLocation, startDate, endDate are required."
      });
    }

    const car = await Car.findOne({ _id: carId, isActive: true });
    if (!car) return res.status(404).json({ message: "Car not found." });

    const s = startOfDay(startDate);
    const e = startOfDay(endDate);

    if (e < s) {
      return res.status(400).json({ message: "End date must be after start date." });
    }

    const days = calcDaysInclusive(s, e);
    if (days <= 0) {
      return res.status(400).json({ message: "Invalid booking duration." });
    }

    // ✅ Overlap check (blocks any booking for same car with overlapping date range)
    // Overlap logic: existing.start <= newEnd AND existing.end >= newStart
    const conflict = await Booking.findOne({
      car: car._id,
      status: { $in: ["PENDING", "CONFIRMED"] },
      startDate: { $lte: e },
      endDate: { $gte: s }
    });

    if (conflict) {
      return res.status(409).json({
        message: "Car is already booked for selected dates. Choose different dates."
      });
    }

    const pricePerDay = Number(car.pricePerDay);
    const subTotal = pricePerDay * days;

    const taxRate = 0.1; // 10% like your UI
    const taxAmount = Number((subTotal * taxRate).toFixed(2));
    const totalAmount = Number((subTotal + taxAmount).toFixed(2));

    const booking = await Booking.create({
      user: userId,
      car: car._id,
      pickupLocation: String(pickupLocation).trim(),
      startDate: s,
      endDate: e,

      pricePerDay,
      days,
      subTotal,
      taxRate,
      taxAmount,
      totalAmount,

      status: "CONFIRMED"
    });

    return res.status(201).json({
      message: "Booking confirmed.",
      booking
    });
  } catch (err) {
    console.error("createBooking error:", err);
    return res.status(500).json({ message: "Server error." });
  }
};

// ✅ GET /api/bookings/my
exports.getMyBookings = async (req, res) => {
  try {
    const userId = req.user.id;

    const bookings = await Booking.find({ user: userId })
      .populate("car")
      .sort({ createdAt: -1 });

    return res.status(200).json({ count: bookings.length, bookings });
  } catch (err) {
    console.error("getMyBookings error:", err);
    return res.status(500).json({ message: "Server error." });
  }
};

// ✅ GET /api/bookings/:id
exports.getBookingById = async (req, res) => {
  try {
    const userId = req.user.id;

    const booking = await Booking.findOne({ _id: req.params.id, user: userId })
      .populate("car");

    if (!booking) return res.status(404).json({ message: "Booking not found." });

    return res.status(200).json({ booking });
  } catch (err) {
    console.error("getBookingById error:", err);
    return res.status(500).json({ message: "Server error." });
  }
};

// ✅ PATCH /api/bookings/:id/cancel
exports.cancelBooking = async (req, res) => {
  try {
    const userId = req.user.id;

    const booking = await Booking.findOne({ _id: req.params.id, user: userId });
    if (!booking) return res.status(404).json({ message: "Booking not found." });

    if (booking.status === "CANCELLED") {
      return res.status(400).json({ message: "Booking already cancelled." });
    }

    booking.status = "CANCELLED";
    await booking.save();

    return res.status(200).json({ message: "Booking cancelled.", booking });
  } catch (err) {
    console.error("cancelBooking error:", err);
    return res.status(500).json({ message: "Server error." });
  }
};
