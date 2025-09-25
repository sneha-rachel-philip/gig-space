# Gig Space – A Freelance Job Platform

## Overview

**Gig Space** is a full-stack freelance job platform where users can sign up as either **freelancers** or **hirers**. Hirers post jobs, and freelancers can browse listings, view hirer profiles, and submit proposals. Once a proposal is accepted, a **contract** is created and displayed in a shared workspace. The project includes **milestone-based payments**, **file uploads**, and **real-time messaging with memory**, making it a powerful yet easy-to-use solution for remote collaboration.

🔗 **Live Frontend:** [https://gig-space-jobs.vercel.app](https://gig-space-jobs.vercel.app)  
🔗 **Backend API:** [https://gig-space.onrender.com](https://gig-space.onrender.com)

---
## Features

- 🔐 **User Authentication** — Signup/Login for freelancers and hirers
- 📄 **Job Posting** — Hirers can create and manage job listings
- 📨 **Proposals** — Freelancers submit proposals with custom pricing and terms
- 📑 **Contracts** — Accepted proposals are converted into contracts and shared in a workspace
- 💬 **Real-Time Messaging with Memory** — Socket.IO + MongoDB
- 🧾 **Milestone-Based Payments** — Stripe integration, with admin verification
- 📂 **File Uploads** — Using Multer, files are shared in job space
- 🌟 **Review System** — Mutual rating and review post-job
- 🚨 **Flagging System** — Jobs can be reported for admin review
- ⚙️ **Admin Dashboard** — Monitor and verify payments, user activity, and reports

---
## Tech Stack

| Technology | Description |
|------------|-------------|
| **Frontend** | React, Tailwind CSS |
| **Backend**  | Node.js, Express |
| **Database** | MongoDB (with Mongoose) |
| **Realtime** | Socket.IO |
| **Payments** | Stripe |
| **File Uploads** | Multer |
| **Deployment** | Vercel (Frontend), Render (Backend), MongoDB Atlas |

---

## Installation & Setup

> **Note:** This project has separate client and server folders. You’ll need to run both for full functionality.

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/gig-space.git
cd gig-space 
```

### 2. Setup Backend

```bash
cd server
npm install
```

* Create a .env file with the following:
```bash
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:5173
STRIPE_SECRET=your_stripe_secret_key
```

```bash
npm run dev
```

### 3. Setup Frontend
```bash
cd ../client
npm install
npm run dev
```

Open http://localhost:5173 in your browser.

---
## Developer
Sneha Rachel Philip
