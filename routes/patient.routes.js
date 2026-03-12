const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth.middleware");
const {
  getPatientProfile,
  updatePatientProfile,
  getMyPrescriptions,
  getPrescriptionById,
  getMedicalHistory,
} = require("../controllers/patient.controller");

router.use(protect, authorize("patient"));

router.get("/profile", getPatientProfile);
router.put("/profile", updatePatientProfile);
router.get("/prescriptions", getMyPrescriptions);
router.get("/prescriptions/:id", getPrescriptionById);
router.get("/history", getMedicalHistory);

module.exports = router;
