// src/routes/adminAuthRoutes.js
const express = require("express");
const router = express.Router();
const adminAuth = require("../middleware/adminAuth");
const { adminSignup, adminSignin, adminListCars, createCar, updateCar, deleteCar } = require("../controllers/adminAuthController");

// POST /api/admin/signup
router.post("/signup", adminSignup);

// ✅ POST /api/admin/signin
router.post("/signin", adminSignin);

// /api/admin/cars
router.get("/cars", adminAuth, adminListCars);
router.post("/cars", adminAuth, createCar);
router.patch("/cars/:id", adminAuth, updateCar);
router.delete("/cars/:id", adminAuth, deleteCar);

module.exports = router;
