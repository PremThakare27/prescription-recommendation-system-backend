const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth.middleware");
const {
  getDoctorProfile,
  updateDoctorProfile,
  getMyPatients,
  getPatientById,
  getMyPrescriptions,
} = require("../controllers/doctor.controller");

router.use(protect, authorize("doctor"));

router.get("/profile", getDoctorProfile);
router.put("/profile", updateDoctorProfile);
router.get("/patients", getMyPatients);
router.get("/patients/:id", getPatientById);
router.get("/prescriptions", getMyPrescriptions);

module.exports = router;
