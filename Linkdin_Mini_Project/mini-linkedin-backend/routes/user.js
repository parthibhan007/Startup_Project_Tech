const express = require("express");
const User = require("../models/User");
const Post = require("../models/Post");
const router = express.Router();

router.get("/:id", async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");
  const posts = await Post.find({ author: req.params.id });
  res.json({ user, posts });
});

module.exports = router;