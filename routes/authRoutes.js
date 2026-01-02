// src/routes/authRoutes.js
const express = require("express");
const router = express.Router();
const userAuth = require("../middleware/userAuth");
const { signup, signin, getCars, getCarById, getMyProfile } = require("../controllers/authController");

// POST /api/auth/signup
router.post("/signup", signup);

// POST /api/auth/signin
router.post("/signin", signin);
router.get("/cars", getCars);
router.get("/cars/:id", getCarById);
router.get("/me", userAuth, getMyProfile);
module.exports = router;
