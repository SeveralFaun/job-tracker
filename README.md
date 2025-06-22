# 🗂️ Job Application Tracker
> 🚧 **Work in progress**

A full-stack web app to track job applications, built with **React**, **Node.js**, and **Express**.

---

## ✅ Features

- Add, view, and manage job applications
- Track status (Applied, Interview, Rejected, Offer)
- REST API to submit and fetch jobs
- Frontend built with **React + Vite**
- Backend built with **Node.js + Express**
- Stores job data in MongoDB
- Email parser to detect job application confirmations and auto-add them to the tracker

---

## ✉️ Email Integration

- Connects to Gmail via IMAP
- Parses recent unread emails for job application confirmations
- Automatically sends matched applications to the backend and stores them in MongoDB
- Uses basic keyword filtering (`"thank you for applying"`, `"application received"`, etc.)

---

## 🛠️ Planned Improvements

- Improved job title/company extraction from email parser
- Job site scraping (e.g. LinkedIn)
- Authentication and role-based access
- UI/UX styling

---

## 🧰 Tech Stack

- **Frontend:** React, Vite, HTML, CSS
- **Backend:** Node.js, Express, MongoDB, Mongoose
- **Tools:** Git, GitHub, VSCode

---

## 🚀 Running It Locally

```bash
# 1. Clone the repo
git clone https://github.com/SeveralFaun/job-tracker.git
cd job-tracker

# 2. Start the backend
node index.js
Server runs at: http://localhost:3000

### 3. Start the frontend
```bash
cd frontend/job-tracker-frontend
npm install
npm run dev
```
App runs at http://localhost:5173
