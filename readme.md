# 💰 AI-Powered Expense Tracker Server

A smart **AI-powered budget tracking system** that allows users to monitor their expenses and incomes with **live statistics** 📊.  
The system leverages AI for insights 🤖, Prisma for database management 🗄️, Express for the backend server ⚡, and PostgreSQL for storage 🐘.  
Additionally, it integrates **Inngest** for serverless event workflows 🚀 and **Supabase** for authentication and database hosting 🔒.

---

## 🛢️ Database Design

Below is the full database design of the system, including tables for users, transactions, budgets, AI insights, and workflow events:

<p align="center">
  <img src="https://i.ibb.co/PZ0YsFr0/draw-SQL-image-export-2025-08-29.png" alt="Database Design" width="100%">
</p>

---

## ✨ Features

- 💸 Track expenses and incomes in real-time  
- 🤖 AI-powered insights and analytics  
- 📊 Live statistics and reports  
- 🔒 Secure authentication with Supabase  
- 🚀 Event-driven workflows using Inngest  
- ⚡ Fully backend-driven with Express + Prisma + PostgreSQL  

---

## 🛠 Tech Stack

- **Backend:** Node.js, Express.js  
- **Database ORM:** Prisma  
- **Database:** PostgreSQL (hosted on Supabase)  
- **AI Event Workflows:** Inngest  
- **Authentication & Hosting:** Supabase  

---

## 📦 Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/abdullahal5/Ai-Powered-Budget-Tracker-Server.git
cd Ai-Powered-Budget-Tracker-Server
npm install
# or
yarn install
```

---

## 🔑 Environment Variables

Create a `.env` file in the root of the project and add the following variables (use your own secure values instead of these demo placeholders):

```env
# Database URLs
DATABASE_URL="postgresql://username:password@host:port/dbname"
DIRECT_URL="postgresql://username:password@host:port/dbname"

# Node Environment
NODE_ENV="development"
PORT=5000

# JWT Tokens
JWT_SECRET="your_jwt_secret"
EXPIRES_IN="30d"
REFRESH_TOKEN_SECRET="your_refresh_token_secret"
REFRESH_TOKEN_EXPIRES_IN="30d"

# Password Reset
RESET_PASS_TOKEN="your_reset_token_secret"
RESET_PASS_TOKEN_EXPIRES_IN="5m"
RESET_PASS_LINK="https://your-frontend/reset-password"

# Email Settings
EMAIL="youremail@example.com"
APP_PASS="your_app_password"
```