const Prescription = require("../models/Prescription.model");

// Simple symptom-to-medication mapping for the recommendation engine
// In production, this would be replaced by an ML model or external medical API
const symptomMap = {
  fever: [
    { name: "Paracetamol", dosage: "500mg", frequency: "Every 6 hours", duration: "5 days", instructions: "Take with water" },
    { name: "Ibuprofen", dosage: "400mg", frequency: "Every 8 hours", duration: "3 days", instructions: "Take after meals" },
  ],
  headache: [
    { name: "Paracetamol", dosage: "500mg", frequency: "Every 6 hours", duration: "3 days", instructions: "Take with water" },
    { name: "Aspirin", dosage: "300mg", frequency: "Every 8 hours", duration: "3 days", instructions: "Avoid on empty stomach" },
  ],
  infection: [
    { name: "Amoxicillin", dosage: "500mg", frequency: "Three times daily", duration: "7 days", instructions: "Complete the full course" },
    { name: "Azithromycin", dosage: "250mg", frequency: "Once daily", duration: "5 days", instructions: "Take with or without food" },
  ],
  allergy: [
    { name: "Cetirizine", dosage: "10mg", frequency: "Once daily", duration: "7 days", instructions: "Take at night" },
    { name: "Loratadine", dosage: "10mg", frequency: "Once daily", duration: "7 days", instructions: "Take in the morning" },
  ],
  cough: [
    { name: "Dextromethorphan", dosage: "15mg", frequency: "Every 6-8 hours", duration: "5 days", instructions: "Take with warm water" },
    { name: "Guaifenesin", dosage: "400mg", frequency: "Every 4 hours", duration: "5 days", instructions: "Drink plenty of fluids" },
  ],
  pain: [
    { name: "Ibuprofen", dosage: "400mg", frequency: "Every 8 hours", duration: "5 days", instructions: "Take after meals" },
    { name: "Diclofenac", dosage: "50mg", frequency: "Twice daily", duration: "5 days", instructions: "Take with food" },
  ],
  diabetes: [
    { name: "Metformin", dosage: "500mg", frequency: "Twice daily", duration: "30 days", instructions: "Take with meals" },
  ],
  hypertension: [
    { name: "Amlodipine", dosage: "5mg", frequency: "Once daily", duration: "30 days", instructions: "Take at the same time each day" },
  ],
};

// @route POST /api/recommendations
// Doctor submits symptoms, gets medication suggestions
exports.getRecommendations = async (req, res) => {
  try {
    const { symptoms } = req.body;

    if (!symptoms || !Array.isArray(symptoms) || symptoms.length === 0) {
      return res.status(400).json({ success: false, message: "Please provide an array of symptoms" });
    }

    const recommendations = [];
    const seen = new Set();

    symptoms.forEach((symptom) => {
      const key = symptom.toLowerCase().trim();
      const matches = symptomMap[key] || [];
      matches.forEach((med) => {
        if (!seen.has(med.name)) {
          seen.add(med.name);
          recommendations.push({ ...med, basedOn: key });
        }
      });
    });

    // Also pull the 3 most common medications prescribed for these symptoms from DB
    const historicalData = await Prescription.aggregate([
      { $match: { symptoms: { $in: symptoms.map((s) => new RegExp(s, "i")) } } },
      { $unwind: "$medications" },
      { $group: { _id: "$medications.name", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 3 },
    ]);

    res.json({
      success: true,
      data: {
        suggestions: recommendations,
        historicallyCommon: historicalData.map((d) => ({ name: d._id, prescribedCount: d.count })),
        disclaimer: "These are suggestions only. Always apply clinical judgment before prescribing.",
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
