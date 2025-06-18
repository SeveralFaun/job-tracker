# Job Application Tracker
# IN PROGRESS*

A full-stack web app to track job applications, built with **React** and **Express**.

## Features

- Add, view, and manage job applications
- Track application status (Applied, Interview, Rejected, Offer)
- Frontend built with **React + Vite**
- Backend built with **Node.js + Express**
- REST API to submit and fetch jobs
- Local JSON/in-memory storage (for now)

## Planned

- Edit and delete jobs
- Connect to a database
- Automate job tracking by parsing emails or scraping job sites
- Add authentication and security
- UI styling

## Tech Stack

- **Frontend**: React, Vite, HTML, CSS
- **Backend**: Node.js, Express
- **Dev Tools**: VSCode, Git, GitHub

## How to Run It Locally

### 1. Clone this repo

```bash
git clone https://github.com/YOUR_USERNAME/job-tracker.git
cd job-tracker
```

### 2. Start the backend
```bash
node index.js
```
Server will run at http://localhost:3000

### 3. Start the frontend
```bash
cd frontend/job-tracker-frontend
npm install
npm run dev
```
App runs at http://localhost:5173