// src/controllers/adminAuthController.js
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");
const Car = require("../models/Car");
const signToken = (adminId) => {
  return jwt.sign(
    { id: adminId, role: "ADMIN" },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
};

exports.adminSignup = async (req, res) => {
  try {
    const { name, email, password, adminSecretKey } = req.body;

    if (adminSecretKey !== process.env.ADMIN_SECRET_KEY) {
      return res.status(403).json({ message: "Unauthorized admin access." });
    }

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required." });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters." });
    }

    const existingAdmin = await Admin.findOne({ email: email.toLowerCase() });
    if (existingAdmin) {
      return res.status(409).json({ message: "Admin already exists." });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const admin = await Admin.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
    });

    const token = signToken(admin._id);

    return res.status(201).json({
      message: "Admin account created successfully.",
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (err) {
    console.error("Admin signup error:", err);
    return res.status(500).json({ message: "Server error." });
  }
};

// ✅ ADD THIS: Admin Sign In
exports.adminSignin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required." });
    }

    const admin = await Admin.findOne({ email: email.toLowerCase() });
    if (!admin) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const ok = await bcrypt.compare(password, admin.passwordHash);
    if (!ok) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const token = signToken(admin._id);

    return res.status(200).json({
      message: "Admin signed in successfully.",
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (err) {
    console.error("Admin signin error:", err);
    return res.status(500).json({ message: "Server error." });
  }
};




const isValidUrl = (url) => {
  try {
    const u = new URL(url);
    return ["http:", "https:"].includes(u.protocol);
  } catch {
    return false;
  }
};

exports.createCar = async (req, res) => {
  try {
    const {
      title,
      brand,
      category,
      pricePerDay,
      transmission,
      fuelType,
      seats,
      rating,
      reviewsCount,
      isFeatured,
      isActive,
      imageUrl, // ✅ from admin
    } = req.body;

    // Required fields
    if (!title || !category || !pricePerDay || !fuelType || !imageUrl) {
      return res.status(400).json({
        message: "title, category, pricePerDay, fuelType, imageUrl are required.",
      });
    }

    if (!isValidUrl(imageUrl)) {
      return res.status(400).json({ message: "imageUrl must be a valid http/https link." });
    }

    const car = await Car.create({
      title: String(title).trim(),
      brand: brand ? String(brand).trim() : undefined,
      category,
      pricePerDay: Number(pricePerDay),
      transmission: transmission || "Automatic",
      fuelType,
      seats: seats ? Number(seats) : 5,
      rating: rating ? Number(rating) : 4.5,
      reviewsCount: reviewsCount ? Number(reviewsCount) : 0,
      isFeatured: String(isFeatured) === "true" || isFeatured === true,
      isActive: isActive === undefined ? true : (String(isActive) === "true" || isActive === true),
      imageUrl: String(imageUrl).trim(),
      createdBy: req.admin?._id,
    });

    return res.status(201).json({ message: "Car added successfully.", car });
  } catch (err) {
    console.error("createCar error:", err);
    return res.status(500).json({ message: "Server error." });
  }
};

exports.updateCar = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };

    // If imageUrl present, validate
    if (updates.imageUrl !== undefined) {
      if (!isValidUrl(updates.imageUrl)) {
        return res.status(400).json({ message: "imageUrl must be a valid http/https link." });
      }
      updates.imageUrl = String(updates.imageUrl).trim();
    }

    // Convert numeric fields if present
    if (updates.pricePerDay !== undefined) updates.pricePerDay = Number(updates.pricePerDay);
    if (updates.seats !== undefined) updates.seats = Number(updates.seats);
    if (updates.rating !== undefined) updates.rating = Number(updates.rating);
    if (updates.reviewsCount !== undefined) updates.reviewsCount = Number(updates.reviewsCount);

    // Convert boolean fields if present
    if (updates.isFeatured !== undefined) {
      updates.isFeatured = String(updates.isFeatured) === "true" || updates.isFeatured === true;
    }
    if (updates.isActive !== undefined) {
      updates.isActive = String(updates.isActive) === "true" || updates.isActive === true;
    }

    const car = await Car.findByIdAndUpdate(id, updates, { new: true });
    if (!car) return res.status(404).json({ message: "Car not found." });

    return res.status(200).json({ message: "Car updated successfully.", car });
  } catch (err) {
    console.error("updateCar error:", err);
    return res.status(500).json({ message: "Server error." });
  }
};

exports.deleteCar = async (req, res) => {
  try {
    const { id } = req.params;

    const car = await Car.findByIdAndDelete(id);
    if (!car) return res.status(404).json({ message: "Car not found." });

    return res.status(200).json({ message: "Car deleted successfully." });
  } catch (err) {
    console.error("deleteCar error:", err);
    return res.status(500).json({ message: "Server error." });
  }
};

exports.adminListCars = async (req, res) => {
  try {
    const cars = await Car.find().sort({ createdAt: -1 });
    return res.status(200).json({ cars });
  } catch (err) {
    console.error("adminListCars error:", err);
    return res.status(500).json({ message: "Server error." });
  }
};
