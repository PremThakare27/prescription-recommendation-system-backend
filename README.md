# MediScript — Backend

A secure, role-based REST API for a digital prescription management system built with Node.js, Express, and MongoDB.

---

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose ODM)
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **Environment**: dotenv

---

## Project Structure

```
prescription-recommendation-system-backend/
├── config/
│   └── db.js                  # MongoDB connection
├── controllers/
│   ├── auth.controller.js     # Register, login, profile
│   ├── doctor.controller.js   # Doctor-specific routes
│   ├── patient.controller.js  # Patient-specific routes
│   ├── prescription.controller.js  # Prescription CRUD + OCR
│   ├── admin.controller.js    # Admin management + analytics
│   └── recommendation.controller.js  # Drug recommendations
├── middleware/
│   └── auth.middleware.js     # JWT protect + role authorization
├── models/
│   ├── User.model.js          # Unified user model (doctor/patient/admin)
│   └── Prescription.model.js  # Prescription with medications array
├── routes/
│   ├── auth.routes.js
│   ├── doctor.routes.js
│   ├── patient.routes.js
│   ├── prescription.routes.js
│   ├── admin.routes.js
│   └── recommendation.routes.js
├── .env.example
├── package.json
└── server.js
```

---

## Getting Started

### Prerequisites
- Node.js v18+
- MongoDB Atlas account (or local MongoDB)

### Installation

```bash
# Clone the repository
git clone https://github.com/PremThakare27/prescription-recommendation-system-backend.git
cd prescription-recommendation-system-backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

### Environment Variables

Create a `.env` file in the root directory:

```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/prescriptiondb
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d
NODE_ENV=development
```

### Run the server

```bash
# Development (with nodemon)
npm run dev

# Production
npm start
```

Server will start at `http://localhost:5000`

---

## API Reference

### Auth Routes — `/api/auth`

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/register` | Public | Register as doctor or patient |
| POST | `/login` | Public | Login and get JWT token |
| GET | `/me` | Protected | Get current user profile |
| PUT | `/change-password` | Protected | Change password |

### Doctor Routes — `/api/doctors`

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/patients` | Doctor | Get assigned patients |
| GET | `/patients/:id` | Doctor | Get patient details |
| GET | `/profile` | Doctor | Get doctor profile |
| PUT | `/profile` | Doctor | Update doctor profile |
| GET | `/prescriptions` | Doctor | Get prescriptions issued |

### Patient Routes — `/api/patients`

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/profile` | Patient | Get patient profile |
| PUT | `/profile` | Patient | Update patient profile |
| GET | `/prescriptions` | Patient | Get all prescriptions |
| GET | `/prescriptions/:id` | Patient | Get prescription by ID |
| GET | `/medical-history` | Patient | Get medical history |

### Prescription Routes — `/api/prescriptions`

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/` | Doctor | Create a prescription |
| POST | `/ocr` | Patient | Save OCR-scanned prescription |
| GET | `/:id` | Doctor/Patient | Get prescription by ID |
| PUT | `/:id` | Doctor | Update prescription |
| DELETE | `/:id` | Doctor/Admin | Delete prescription |

### Admin Routes — `/api/admin`

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/stats` | Admin | Get system stats |
| GET | `/users` | Admin | Get all users (filter by role) |
| POST | `/users` | Admin | Create a user |
| DELETE | `/users/:id` | Admin | Delete a user |
| PUT | `/users/:id/toggle-status` | Admin | Activate/deactivate user |
| PUT | `/patients/:id/assign-doctor` | Admin | Assign doctor to patient |
| GET | `/analytics/prescriptions-over-time` | Admin | Prescriptions per month |
| GET | `/analytics/top-drugs` | Admin | Most prescribed drugs |

### Recommendation Routes — `/api/recommendations`

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/` | Doctor | Get drug recommendations by symptoms |

---

## User Roles

| Role | Capabilities |
|------|-------------|
| **Doctor** | View assigned patients, create/update prescriptions, check drug interactions |
| **Patient** | View prescriptions, upload OCR prescriptions, view medical history |
| **Admin** | Manage all users, assign doctors to patients, view analytics |

> **Note:** Admin accounts cannot self-register. The first admin must be created directly via the API with the self-registration guard temporarily disabled.

---

## Authentication

All protected routes require a Bearer token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

Tokens are valid for 7 days by default (configurable via `JWT_EXPIRE`).

---

## Features

- **JWT Authentication** with role-based access control
- **Password hashing** with bcryptjs
- **OCR Prescription Support** — patients can save scanned prescriptions
- **Drug Recommendation Engine** — symptom-based medication suggestions
- **Admin Analytics** — real-time stats, top drugs, prescriptions over time
- **Doctor-Patient Assignment** — admin assigns patients to specific doctors

---

## Future Scope

- AI-powered chatbot integration (Ollama/LLM)
- Teleconsultation via Twilio/Zoom API
- Insurance and pharmacy integration
- Push notifications for prescription reminders
- Mobile app (React Native)