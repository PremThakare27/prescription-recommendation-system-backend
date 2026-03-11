const User = require("../models/User.model");
const Prescription = require("../models/Prescription.model");

// @route GET /api/doctors/patients
// Doctor gets their assigned patients
exports.getMyPatients = async (req, res) => {
  try {
    const patients = await User.find({ role: "patient", assignedDoctor: req.user._id }).select("-password");
    res.json({ success: true, count: patients.length, data: patients });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route GET /api/doctors/patients/:id
// Doctor views a specific patient's profile
exports.getPatientById = async (req, res) => {
  try {
    const patient = await User.findOne({ _id: req.params.id, role: "patient" }).select("-password");
    if (!patient) return res.status(404).json({ success: false, message: "Patient not found" });
    res.json({ success: true, data: patient });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route GET /api/doctors/profile
exports.getDoctorProfile = async (req, res) => {
  try {
    const doctor = await User.findById(req.user._id).select("-password");
    res.json({ success: true, data: doctor });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route PUT /api/doctors/profile
exports.updateDoctorProfile = async (req, res) => {
  try {
    const allowedFields = ["name", "phone", "specialization", "hospital"];
    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const doctor = await User.findByIdAndUpdate(req.user._id, updates, { new: true }).select("-password");
    res.json({ success: true, data: doctor });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route GET /api/doctors/prescriptions
// Doctor sees all prescriptions they've issued
exports.getMyPrescriptions = async (req, res) => {
  try {
    const prescriptions = await Prescription.find({ doctor: req.user._id })
      .populate("patient", "name email dateOfBirth gender")
      .sort({ createdAt: -1 });
    res.json({ success: true, count: prescriptions.length, data: prescriptions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
