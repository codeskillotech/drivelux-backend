const express = require("express");
const router = express.Router();

const userAuth = require("../middleware/userAuth");
const {
  createBooking,
  getMyBookings,
  getBookingById,
  cancelBooking
} = require("../controllers/bookingController");

// /api/bookings
router.post("/", userAuth, createBooking);

// /api/bookings/my
router.get("/my", userAuth, getMyBookings);

// /api/bookings/:id
router.get("/:id", userAuth, getBookingById);

// /api/bookings/:id/cancel
router.patch("/:id/cancel", userAuth, cancelBooking);

module.exports = router;
