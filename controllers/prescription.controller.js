const Prescription = require("../models/Prescription.model");
const User = require("../models/User.model");

// @route POST /api/prescriptions
// Doctor creates a prescription
exports.createPrescription = async (req, res) => {
  try {
    const { patientId, symptoms, diagnosis, medications, notes, followUpDate } = req.body;

    const patient = await User.findOne({ _id: patientId, role: "patient" });
    if (!patient) return res.status(404).json({ success: false, message: "Patient not found" });

    const prescription = await Prescription.create({
      doctor: req.user._id,
      patient: patientId,
      symptoms,
      diagnosis,
      medications,
      notes,
      followUpDate,
    });

    await prescription.populate("patient", "name email dateOfBirth");
    await prescription.populate("doctor", "name specialization");

    res.status(201).json({ success: true, data: prescription });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route POST /api/prescriptions/ocr
// Patient saves an OCR-scanned prescription
exports.createOCRPrescription = async (req, res) => {
  try {
    const { diagnosis, medications, notes, rawText } = req.body;

    const patient = await User.findById(req.user._id);
    if (!patient.assignedDoctor) {
      return res.status(400).json({ success: false, message: "You don't have an assigned doctor yet" });
    }

    const prescription = await Prescription.create({
      doctor: patient.assignedDoctor,
      patient: req.user._id,
      diagnosis,
      medications,
      notes,
      rawText,
      source: "ocr",
    });

    res.status(201).json({ success: true, data: prescription });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route GET /api/prescriptions/:id
exports.getPrescriptionById = async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id)
      .populate("doctor", "name specialization licenseNumber hospital")
      .populate("patient", "name dateOfBirth gender bloodGroup allergies");

    if (!prescription) return res.status(404).json({ success: false, message: "Prescription not found" });

    const userId = req.user._id.toString();
    const isDoctor = prescription.doctor?._id.toString() === userId;
    const isPatient = prescription.patient._id.toString() === userId;
    if (!isDoctor && !isPatient && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    res.json({ success: true, data: prescription });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route PUT /api/prescriptions/:id
exports.updatePrescription = async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id);
    if (!prescription) return res.status(404).json({ success: false, message: "Prescription not found" });

    if (prescription.doctor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized to update this prescription" });
    }

    const allowedFields = ["symptoms", "diagnosis", "medications", "notes", "followUpDate", "status"];
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) prescription[field] = req.body[field];
    });

    await prescription.save();
    res.json({ success: true, data: prescription });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route DELETE /api/prescriptions/:id
exports.deletePrescription = async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id);
    if (!prescription) return res.status(404).json({ success: false, message: "Prescription not found" });

    if (prescription.doctor?.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    await prescription.deleteOne();
    res.json({ success: true, message: "Prescription deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};