const User = require("../models/User.model");
const Prescription = require("../models/Prescription.model");

// @route GET /api/admin/users
exports.getAllUsers = async (req, res) => {
  try {
    const filter = {};
    if (req.query.role) filter.role = req.query.role;

    const users = await User.find(filter).select("-password").sort({ createdAt: -1 });
    res.json({ success: true, count: users.length, data: users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route POST /api/admin/users
exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role, phone, specialization, licenseNumber, hospital, dateOfBirth, gender, bloodGroup } = req.body;

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ success: false, message: "Email already registered" });

    const user = await User.create({
      name, email, password, role, phone,
      specialization, licenseNumber, hospital,
      dateOfBirth, gender, bloodGroup,
    });

    res.status(201).json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route PUT /api/admin/users/:id/toggle-status
exports.toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    user.isActive = !user.isActive;
    await user.save();

    res.json({ success: true, message: `User ${user.isActive ? "activated" : "deactivated"}`, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route PUT /api/admin/patients/:id/assign-doctor
exports.assignDoctor = async (req, res) => {
  try {
    const { doctorId } = req.body;

    const doctor = await User.findOne({ _id: doctorId, role: "doctor" });
    if (!doctor) return res.status(404).json({ success: false, message: "Doctor not found" });

    const patient = await User.findOneAndUpdate(
      { _id: req.params.id, role: "patient" },
      { assignedDoctor: doctorId },
      { new: true }
    ).select("-password");

    if (!patient) return res.status(404).json({ success: false, message: "Patient not found" });

    res.json({ success: true, message: "Doctor assigned to patient", data: patient });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route GET /api/admin/stats
exports.getStats = async (req, res) => {
  try {
    const [totalDoctors, totalPatients, totalPrescriptions, activePrescriptions] = await Promise.all([
      User.countDocuments({ role: "doctor" }),
      User.countDocuments({ role: "patient" }),
      Prescription.countDocuments(),
      Prescription.countDocuments({ status: "active" }),
    ]);

    res.json({ success: true, data: { totalDoctors, totalPatients, totalPrescriptions, activePrescriptions } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route DELETE /api/admin/users/:id
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    await user.deleteOne();
    res.json({ success: true, message: "User deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route GET /api/admin/analytics/prescriptions-over-time
exports.getPrescriptionsOverTime = async (req, res) => {
  try {
    const data = await Prescription.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
      { $limit: 12 },
    ]);

    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const formatted = data.map((d) => ({
      name: `${months[d._id.month - 1]} ${d._id.year}`,
      prescriptions: d.count,
    }));

    res.json({ success: true, data: formatted });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route GET /api/admin/analytics/top-drugs
exports.getTopDrugs = async (req, res) => {
  try {
    const data = await Prescription.aggregate([
      { $unwind: "$medications" },
      {
        $group: {
          _id: "$medications.name",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 8 },
    ]);

    const formatted = data.map((d) => ({
      name: d._id,
      prescriptions: d.count,
    }));

    res.json({ success: true, data: formatted });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};