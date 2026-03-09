const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth.middleware");
const { register, login, getMe, changePassword } = require("../controllers/auth.controller");
const User = require("../models/User.model");

router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, getMe);
router.put("/change-password", protect, changePassword);

// Admin profile update
router.put("/me", protect, async (req, res) => {
  try {
    const { name, phone } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, phone },
      { new: true }
    ).select("-password");
    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;