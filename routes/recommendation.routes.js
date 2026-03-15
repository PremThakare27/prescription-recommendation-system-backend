const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth.middleware");
const { getRecommendations } = require("../controllers/recommendation.controller");

router.post("/", protect, authorize("doctor"), getRecommendations);

module.exports = router;
