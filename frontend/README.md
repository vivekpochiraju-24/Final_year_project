# Appointment Frontend

Simple React scaffold for the appointment booking demo.

- Run `npm install` then `npm start` in `frontend`.
- Set `REACT_APP_API_URL` if your backend is not at http://localhost:5000/api
- Uses Socket.IO client to receive real-time updates and simple WebRTC signaling demo at `/video`.

Docker (local):
- From project root run: `docker-compose up --build` to start frontend, backend and MongoDB.
- Frontend will be available at http://localhost:3000 (served by nginx in container).
