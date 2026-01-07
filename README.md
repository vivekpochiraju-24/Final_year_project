# Appointment Booking (MERN) — Demo

[![CI](https://github.com/<owner>/<repo>/actions/workflows/ci.yml/badge.svg)](https://github.com/<owner>/<repo>/actions/workflows/ci.yml)

This repository contains a demo appointment booking system (MERN stack) with real-time updates via Socket.IO.

> Replace `<owner>/<repo>` in the badge URL above with your GitHub repository (for example: `myuser/myrepo`) to enable the badge for your repo.

Services:
- backend (Express + MongoDB + Socket.IO)
- frontend (React + MUI + Socket.IO client)
- mongo

Run locally with Docker:
- docker-compose up --build

Backend: http://localhost:5000
Frontend: http://localhost:3000

Continuous Integration & Deployment

I added GitHub Actions workflows to run tests/builds and to deploy via SSH when you push to `main`.

Required GitHub Secrets for deployment (Repository -> Settings -> Secrets):
- `SSH_PRIVATE_KEY` — private key for the deploy user (no passphrase) on the target host
- `SSH_HOST` — target server host or IP
- `SSH_PORT` — (optional, default 22)
- `SSH_USER` — SSH username
- `DEPLOY_DIR` — path on the remote host where the repo is checked out and `docker-compose.yml` is located

How deployment works (example setup):
1. On your target server: clone the repo into `DEPLOY_DIR`, install Docker & docker-compose, and ensure `docker-compose` works.
2. Add the deploy user's public key to `~/.ssh/authorized_keys` on the server.
3. Add the secrets above in GitHub.
4. Push to `main` — the `deploy` workflow will SSH to the server, reset to `origin/main`, then run `docker-compose up -d --build`.

Notes & troubleshooting:
- Ensure your remote server already has the repo cloned to `DEPLOY_DIR` and `docker-compose.yml` exists there; the workflow uses `git reset --hard origin/main` to synchronise.
- If you prefer automated copy of the `docker-compose.yml`, we can instead use `scp` to transfer it from the workflow runner.
- For production WebRTC you will need TURN servers and HTTPS; the demo uses simple signaling via Socket.IO.
