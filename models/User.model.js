const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, minlength: 6 },
    role: {
      type: String,
      enum: ["doctor", "patient", "admin"],
      required: true,
    },
    phone: { type: String },
    isActive: { type: Boolean, default: true },

    // Doctor-specific fields
    specialization: { type: String },
    licenseNumber: { type: String },
    hospital: { type: String },

    // Patient-specific fields
    dateOfBirth: { type: Date },
    gender: { type: String, enum: ["male", "female", "other"] },
    bloodGroup: { type: String },
    allergies: [{ type: String }],
    assignedDoctor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);