const User = require("../models/User.model");
const Prescription = require("../models/Prescription.model");

// @route GET /api/patients/profile
exports.getPatientProfile = async (req, res) => {
  try {
    const patient = await User.findById(req.user._id)
      .select("-password")
      .populate("assignedDoctor", "name specialization hospital phone");
    res.json({ success: true, data: patient });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route PUT /api/patients/profile
exports.updatePatientProfile = async (req, res) => {
  try {
    const allowedFields = ["name", "phone", "dateOfBirth", "gender", "bloodGroup", "allergies"];
    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const patient = await User.findByIdAndUpdate(req.user._id, updates, { new: true }).select("-password");
    res.json({ success: true, data: patient });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route GET /api/patients/prescriptions
// Patient views their own prescriptions
exports.getMyPrescriptions = async (req, res) => {
  try {
    const prescriptions = await Prescription.find({ patient: req.user._id })
      .populate("doctor", "name specialization hospital")
      .sort({ createdAt: -1 });
    res.json({ success: true, count: prescriptions.length, data: prescriptions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route GET /api/patients/prescriptions/:id
exports.getPrescriptionById = async (req, res) => {
  try {
    const prescription = await Prescription.findOne({
      _id: req.params.id,
      patient: req.user._id,
    }).populate("doctor", "name specialization hospital licenseNumber");

    if (!prescription) return res.status(404).json({ success: false, message: "Prescription not found" });
    res.json({ success: true, data: prescription });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route GET /api/patients/history
// Full medical history: profile + all prescriptions
exports.getMedicalHistory = async (req, res) => {
  try {
    const [patient, prescriptions] = await Promise.all([
      User.findById(req.user._id).select("-password").populate("assignedDoctor", "name specialization"),
      Prescription.find({ patient: req.user._id })
        .populate("doctor", "name specialization")
        .sort({ createdAt: -1 }),
    ]);

    res.json({ success: true, data: { patient, prescriptions } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
