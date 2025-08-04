# Mini LinkedIn-like Community Platform

This is a full-stack mini LinkedIn-style community platform built with React, Node.js, Express, and MongoDB.

## Features

### 🔐 User Authentication
- Register and login with email & password
- Protected routes using JWT

### 📝 Public Post Feed
- Create, view, and display text-only posts
- Home feed shows author and timestamp

### 👤 Profile Page
- View a user's profile and their posts

## Tech Stack
- **Frontend**: React (with React Router)
- **Backend**: Node.js with Express.js
- **Database**: MongoDB (with Mongoose)
- **Deployment**: Can be deployed using Vercel, Netlify (Frontend) and Render (Backend)

## 📁 Folder Structure
```
mini-linkedin-fullstack/
├── mini-linkedin-frontend/   # React app
│   └── src/
│       └── pages/            # Home, Login, Register, Profile
├── mini-linkedin-backend/    # Express server
│   ├── routes/               # API routes for posts, auth, users
│   ├── models/               # Mongoose schemas
│   └── server.js             # Main entry point
```

## 🛠️ How to Run Locally

### 1. Start MongoDB (if not running)
Make sure MongoDB is running locally on `mongodb://localhost:27017`

### 2. Run the Backend
```
cd mini-linkedin-backend
npm install
npm start
```

### 3. Run the Frontend
```
cd mini-linkedin-frontend
npm install
npm start
```

Visit [http://localhost:3000](http://localhost:3000) to use the application.

## 🌱 Sample MongoDB Document
You can insert this using `mongosh` to verify:
```js
use linkedinClone
db.posts.insertOne({
  title: "Test Post",
  content: "This is the first post from MongoDB.",
  author: "Admin",
  createdAt: new Date()
})
```

---

## 👤 Author
Parthibhan R (Full Stack Developer Intern)