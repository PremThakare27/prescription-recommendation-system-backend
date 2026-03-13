const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth.middleware");
const {
  createPrescription,
  createOCRPrescription,
  getPrescriptionById,
  updatePrescription,
  deletePrescription,
} = require("../controllers/prescription.controller");

router.use(protect);

router.post("/", authorize("doctor"), createPrescription);
router.post("/ocr", authorize("patient"), createOCRPrescription);
router.get("/:id", getPrescriptionById);
router.put("/:id", authorize("doctor"), updatePrescription);
router.delete("/:id", authorize("doctor", "admin"), deletePrescription);

module.exports = router;