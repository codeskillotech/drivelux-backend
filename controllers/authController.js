// src/controllers/authController.js
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Car = require("../models/Car");

const signToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

exports.signup = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, password, confirmPassword } =
      req.body;

    // Basic validation
    if (!firstName || !lastName || !email || !phone || !password || !confirmPassword) {
      return res.status(400).json({ message: "All fields are required." });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: "Invalid email address." });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters." });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match." });
    }

    // Check duplicates
    const existingEmail = await User.findOne({ email: email.toLowerCase() });
    if (existingEmail) {
      return res.status(409).json({ message: "Email already registered." });
    }

    const existingPhone = await User.findOne({ phone });
    if (existingPhone) {
      return res.status(409).json({ message: "Phone already registered." });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      firstName,
      lastName,
      email: email.toLowerCase(),
      phone,
      passwordHash,
    });

    const token = signToken(user._id);

    return res.status(201).json({
      message: "Account created successfully.",
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
      },
    });
  } catch (err) {
    console.error("Signup error:", err);
    return res.status(500).json({ message: "Server error." });
  }
};

exports.signin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const token = signToken(user._id);

    return res.status(200).json({
      message: "Signed in successfully.",
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
      },
    });
  } catch (err) {
    console.error("Signin error:", err);
    return res.status(500).json({ message: "Server error." });
  }
};



// GET /api/cars?category=SUV&sort=featured|priceAsc|priceDesc|rating
exports.getCars = async (req, res) => {
  try {
    const {
      category,
      sort,
      minRating,
      ratingFrom,
      ratingTo,
    } = req.query;

    /**
     * Base filter
     */
    const filter = {
      isActive: true,
    };

    /**
     * Category filter
     */
    if (category && category !== "All") {
      filter.category = category;
    }

    /**
     * Rating filters
     */
    if (minRating) {
      filter.rating = { $gte: Number(minRating) };
    }

    if (ratingFrom || ratingTo) {
      filter.rating = {};
      if (ratingFrom) filter.rating.$gte = Number(ratingFrom);
      if (ratingTo) filter.rating.$lte = Number(ratingTo);
    }

    /**
     * Build query
     */
    let query = Car.find(filter);

    /**
     * Sorting
     */
    switch (sort) {
      case "featured":
        query = query.sort({ isFeatured: -1, createdAt: -1 });
        break;

      case "rating":
        query = query.sort({ rating: -1 });
        break;

      case "priceAsc":
        query = query.sort({ pricePerDay: 1 });
        break;

      case "priceDesc":
        query = query.sort({ pricePerDay: -1 });
        break;

      default:
        query = query.sort({ createdAt: -1 });
    }

    /**
     * Execute query
     */
    const cars = await query;

    return res.status(200).json({
      count: cars.length,
      cars,
    });
  } catch (error) {
    console.error("getCars error:", error);
    return res.status(500).json({
      message: "Server error while fetching cars.",
    });
  }
};

// GET /api/cars/:id
exports.getCarById = async (req, res) => {
  try {
    const car = await Car.findOne({ _id: req.params.id, isActive: true });
    if (!car) return res.status(404).json({ message: "Car not found." });

    return res.status(200).json({ car });
  } catch (err) {
    console.error("getCarById error:", err);
    return res.status(500).json({ message: "Server error." });
  }
};


// GET /api/users/me
exports.getMyProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId).select("-passwordHash");
    if (!user) return res.status(404).json({ message: "User not found." });

    return res.status(200).json({
      message: "Profile fetched successfully.",
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: `${user.firstName} ${user.lastName}`,
        email: user.email,
        phone: user.phone,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (err) {
    console.error("getMyProfile error:", err);
    return res.status(500).json({ message: "Server error." });
  }
};
