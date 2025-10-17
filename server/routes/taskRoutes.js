import express from "express";
import Task from "../models/Task.js";
import User from "../models/User.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

// Protect all routes
router.use(protect);

// Helper: update streak logic
const updateStreak = async (userId) => {
  const user = await User.findById(userId);
  if (!user) return;

  const today = new Date().toISOString().split("T")[0]; // yyyy-mm-dd
  const todaysTasks = await Task.find({ user: userId, date: today });

  if (todaysTasks.length === 0) return; // no tasks → no streak update

  const allDone = todaysTasks.every((t) => t.completed === true);

  if (allDone) {
    // If already updated today, do nothing
    if (user.lastUpdated === today) return;
    user.streak += 1;
    user.lastUpdated = today;
  } else {
    user.streak = 0;
    user.lastUpdated = today;
  }

  await user.save();
};

// Get user’s tasks
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

  // Check streak after update
  await updateStreak(req.user.userId);

  res.json(task);
});

// Delete task
router.delete("/:id", async (req, res) => {
  await Task.findOneAndDelete({ _id: req.params.id, user: req.user.userId });
  await updateStreak(req.user.userId);
  res.json({ message: "Task deleted" });
});

// Get user streak
router.get("/streak", async (req, res) => {
  const user = await User.findById(req.user.userId);
  res.json({ streak: user.streak });
});

export default router;
