const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth.middleware");
const {
  getAllUsers,
  createUser,
  toggleUserStatus,
  assignDoctor,
  getStats,
  deleteUser,
  getPrescriptionsOverTime,
  getTopDrugs,
} = require("../controllers/admin.controller");

router.use(protect, authorize("admin"));

router.get("/stats", getStats);
router.get("/users", getAllUsers);
router.post("/users", createUser);
router.delete("/users/:id", deleteUser);
router.put("/users/:id/toggle-status", toggleUserStatus);
router.put("/patients/:id/assign-doctor", assignDoctor);
router.get("/analytics/prescriptions-over-time", getPrescriptionsOverTime);
router.get("/analytics/top-drugs", getTopDrugs);

module.exports = router;