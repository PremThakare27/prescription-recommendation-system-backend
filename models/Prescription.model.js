const mongoose = require("mongoose");

const medicationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  dosage: { type: String, required: true },
  frequency: { type: String, required: true },
  duration: { type: String, required: true },
  instructions: { type: String },
});

const prescriptionSchema = new mongoose.Schema(
  {
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    symptoms: [{ type: String }],
    diagnosis: { type: String, required: true },
    medications: [medicationSchema],
    notes: { type: String },
    followUpDate: { type: Date },
    status: {
      type: String,
      enum: ["active", "completed", "cancelled"],
      default: "active",
    },
    source: { type: String, enum: ["manual", "ocr"], default: "manual" },
    rawText: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Prescription", prescriptionSchema);