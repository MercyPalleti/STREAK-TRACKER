const express = require("express");
const jwt = require("jsonwebtoken");
const Task = require("../models/Task");
const User = require("../models/User");

const router = express.Router();

// Auth middleware
const protect = (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ message: "No token" });

  const token = auth.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { userId: decoded.userId };
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
};

router.use(protect);

// Get all tasks
router.get("/", async (req, res) => {
  const tasks = await Task.find({ user: req.user.userId });
  res.json(tasks);
});

// Add task
router.post("/", async (req, res) => {
  const { title, date } = req.body;
  const task = new Task({ title, date, user: req.user.userId });
  await task.save();
  res.json(task);
});

// Toggle completion
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { completed } = req.body;

  const task = await Task.findOneAndUpdate(
    { _id: id, user: req.user.userId },
    { completed },
    { new: true }
  );

  // Update streak if needed
  const user = await User.findById(req.user.userId);
  const todayTasks = await Task.find({ user: req.user.userId, date: task.date });
  const allDone = todayTasks.every((t) => t.completed);
  if (allDone) user.streak += 1;
  else user.streak = 0;
  await user.save();

  res.json(task);
});

// Delete task
router.delete("/:id", async (req, res) => {
  await Task.findOneAndDelete({ _id: req.params.id, user: req.user.userId });
  res.json({ message: "Task deleted" });
});

// Get streak
router.get("/streak", async (req, res) => {
  const user = await User.findById(req.user.userId);
  res.json({ streak: user.streak });
});

module.exports = router;
