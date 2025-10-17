import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import taskRoutes from "./routes/taskRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import User from "./models/User.js";
import Task from "./models/Task.js";
import cron from "node-cron";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.log(err));

app.listen(process.env.PORT, () =>
  console.log(`🚀 Server running on port ${process.env.PORT}`)
);

/* 🕐 DAILY STREAK CHECKER JOB */
//cron.schedule("0 0 * * *", async () => {
 cron.schedule("*/1 * * * *", async () => { // use this for testing every 1 min
  console.log("🕛 Running daily streak + task reset jobs...");

  const users = await User.find();

  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 60000).toISOString().split("T")[0];


  for (const user of users) {
    const yesterdayTasks = await Task.find({ user: user._id, date: yesterday });

    // 🔹 STREAK RESET LOGIC
    if (yesterdayTasks.length > 0) {
      const allDone = yesterdayTasks.every((t) => t.completed === true);
      if (!allDone) {
        user.streak = 0;
        console.log(`❌ ${user.name}'s streak reset (missed yesterday)`);
      }
    }

    // 🔹 TASK RESET LOGIC
    if (yesterdayTasks.length > 0) {
      for (const oldTask of yesterdayTasks) {
        const newTask = new Task({
          user: user._id,
          title: oldTask.title,
          completed: false,
          date: today,
        });
        await newTask.save();
      }
      console.log(`🔁 Reset tasks for ${user.name} for ${today}`);
    }

    await user.save();
  }

  console.log("✅ Daily streak + task reset complete.");
});
