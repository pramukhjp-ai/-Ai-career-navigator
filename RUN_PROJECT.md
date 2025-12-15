# 🚀 How to Run AI Career Navigator - Step by Step Guide

## Prerequisites
Make sure you have the following installed:
- **Node.js** (v14+)
- **Python** (v3.8+)
- **MongoDB** (running on port 27017)
- **npm** and **pip**

---

## Step 1: Open Terminal

Open your terminal/command prompt and navigate to the project directory:

```bash
cd /Users/pramukh/Downloads/AI-Career-Navigator-main
```

---

## Step 2: Start MongoDB (if not already running)

MongoDB should be running. You can start it with:

```bash
mongod
```

Or if installed via Homebrew on macOS:

```bash
brew services start mongodb-community
```

Check if MongoDB is running:
```bash
lsof -i :27017
```

---

## Step 3: Start Node.js Server (Terminal 1)

Open a **NEW terminal window** (keep MongoDB running in the first one) and run:

```bash
cd /Users/pramukh/Downloads/AI-Career-Navigator-main/Login
npm install    # Only needed first time
npm run dev
```

**Expected Output:**
```
> registerloginnode@1.0.0 dev
> nodemon app.js

[nodemon] 2.0.22
Server is running on port 8080
Connected to MongoDB
```

✅ Node.js is now running on **Port 8080**

---

## Step 4: Start Python Server (Terminal 2)

Open another **NEW terminal window** and run:

```bash
cd /Users/pramukh/Downloads/AI-Career-Navigator-main/recommandation
python app.py
```

**Expected Output:**
```
[APP] Loading career data...
[APP] Loading aptitude questions...
[APP] Loaded 20 questions
[APP] Initializing ML model...
[APP] Model loaded from cache ✓
[APP] Flask app initialized ✓
 * Running on http://127.0.0.1:5001
```

✅ Python Flask is now running on **Port 5001**

---

## Step 5: Open Your Browser

Open your web browser and go to:

```
http://localhost:8080/dashboard
```

---

## Step 6: Login or Register

You should see the **Dashboard** page:

1. **First time?** Click on the page to go to **Register**
   - Create an account with email and password
   
2. **Already have account?** Click **Login**
   - Enter your credentials

---

## Step 7: Explore Features

After logging in, you'll see the **Dashboard** with these options:

### Option 1: Enter Details (Career Recommendations)
- Click **"Enter Details"** card
- Fill in your details:
  - Class/Grade
  - Skills
  - Interests
  - Hobbies
  - Passion
  - Favourite Subject
- Click **"Get Recommendations"**
- You'll see 3 career matches
- Click on any career (e.g., "UI/UX Designer") to see details

### Option 2: Resume Manager
- Click **"Resume Manager"** in sidebar
- Create a new resume
- Fill in your information
- Get ATS score (0-100)
- Download as PDF

### Option 3: IQ/Aptitude Test
- Click **"IQ Test"** in sidebar
- Answer aptitude questions
- Get your score

### Option 4: Other Features
- **Trivia** - Knowledge testing
- **Chat** - Career counselor chatbot
- **FAQ** - Frequently asked questions

---

## Summary of Running Servers

| Service | Command | Port | Status |
|---------|---------|------|--------|
| **MongoDB** | `mongod` | 27017 | ✅ Essential |
| **Node.js** | `npm run dev` (in Login/) | 8080 | ✅ Running |
| **Python Flask** | `python app.py` (in recommandation/) | 5001 | ✅ Running |
| **Web App** | Open browser | - | `http://localhost:8080/dashboard` |

---

## Troubleshooting

### Port 8080 already in use?
```bash
lsof -i :8080
kill -9 <PID>
```

### Port 5001 already in use?
```bash
lsof -i :5001
kill -9 <PID>
```

### MongoDB not connecting?
Make sure MongoDB is running:
```bash
mongod
```

### npm packages not installed?
```bash
cd Login
npm install
```

### Python dependencies missing?
```bash
cd recommandation
pip install -r requirements.txt
```

---

## Quick Start (All at Once)

If you want to run everything in one go, use the combined script:

```bash
cd /Users/pramukh/Downloads/AI-Career-Navigator-main
bash start-servers-combined.sh
```

This will start both Node.js and Python servers automatically.

---

## ✅ Your Project is Ready!

🎯 **Access:** `http://localhost:8080/dashboard`

Enjoy exploring the AI Career Navigator! 🚀
