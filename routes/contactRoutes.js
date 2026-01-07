// src/routes/contactRoutes.js
const express = require("express");
const router = express.Router();

const {
  createContactMessage,
  getContactMessages,
  getContactMessageById,
  updateContactMessageStatus,
  deleteContactMessage,
} = require("../controllers/contactController");

// Public – used by your contact form
router.post("/", createContactMessage);

// Admin – list & manage messages (later you can protect with auth middleware)
router.get("/", getContactMessages);
router.get("/:id", getContactMessageById);
router.patch("/:id/status", updateContactMessageStatus);
router.delete("/:id", deleteContactMessage);

module.exports = router;
