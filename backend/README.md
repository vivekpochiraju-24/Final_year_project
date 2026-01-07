# Appointment Booking Backend

This backend is part of the MERN appointment booking demo. It provides REST APIs for auth, doctors, appointments and notifications and socket.io for real-time updates.

Quick start:

- copy `.env.example` to `.env` and set `MONGO_URI` and `JWT_SECRET`
- npm install
- npm run seed
- npm run dev

Tests & Postman:

- Import `backend/postman_collection.json` into Postman.
- Run smoke tests (require server running at http://localhost:5000):

  npm install
  npm test

Docker (local):

- Build and run with docker-compose (from project root):

  docker-compose up --build

- Backend will be available at http://localhost:5000 and MongoDB at mongodb://localhost:27017

APIs (basic):
- POST /api/auth/register
- POST /api/auth/login
- GET /api/doctors
- POST /api/doctors (doctor or admin)
- POST /api/doctors/:id/slots (doctor only)
- GET /api/appointments/slots?doctorId=&date=
- POST /api/appointments (patient)
- GET /api/appointments (auth: patient/doctor/admin)
- PUT /api/appointments/:id
- DELETE /api/appointments/:id

Socket.IO events:
- client should join rooms `doctor_<doctorId>` and `user_<userId>` to receive real-time updates
- emitted events: `slot_updated`, `appointment_booked`, `appointment_updated`, `appointment_cancelled`, `notification`

Notifications endpoints:
- GET /api/notifications  (auth: user) — list user notifications
- PUT /api/notifications/:id/read  (auth: user) — mark as read
- POST /api/notifications  (auth: admin) — create notification (system/admin)

More endpoints and validations will be added next.
