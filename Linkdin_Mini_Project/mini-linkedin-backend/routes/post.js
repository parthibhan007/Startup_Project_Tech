const express = require("express");
const Post = require("../models/Post");
const jwt = require("jsonwebtoken");
const router = express.Router();

function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch {
    res.status(403).json({ error: "Invalid token" });
  }
}

router.post("/", authMiddleware, async (req, res) => {
  const { content } = req.body;
  const post = new Post({ content, author: req.userId });
  await post.save();
  res.status(201).json(post);
});

router.get("/", async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 }); // ❌ no .populate
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;