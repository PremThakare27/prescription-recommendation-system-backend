const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/doctors", require("./routes/doctor.routes"));
app.use("/api/patients", require("./routes/patient.routes"));
app.use("/api/prescriptions", require("./routes/prescription.routes"));
app.use("/api/admin", require("./routes/admin.routes"));
app.use("/api/recommendations", require("./routes/recommendation.routes"));

app.get("/", (req, res) => res.json({ message: "Prescription API running" }));

app.use((err, req, res, next) => {
  console.error("ERROR DETAILS:", err);
  const status = err.statusCode || err.status || 500;
  res.status(status).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));