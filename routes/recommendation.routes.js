const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth.middleware");
const { getRecommendations, chat } = require("../controllers/recommendation.controller");

router.use(protect);

router.post("/", getRecommendations);
router.post("/chat", chat);

module.exports = router;
