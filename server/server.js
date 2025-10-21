const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const cron = require("node-cron");

dotenv.config();

const taskRoutes = require("./routes/taskRoutes");
const authRoutes = require("./routes/authRoutes");
const User = require("./models/User");
const Task = require("./models/Task");

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);

// Connect MongoDB and start server
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected");

    app.listen(process.env.PORT, () =>
      console.log(`🚀 Server running on port ${process.env.PORT}`)
    );

    // Cron job: run every 1 minute for testing
    cron.schedule("*/1 * * * *", async () => {
      console.log("🕛 Running daily streak + task reset jobs...");

      try {
        const users = await User.find();
        const now = new Date();
        const today = now.toISOString().split("T")[0];
        const yesterday = new Date(now.getTime() - 60000) // 1 min ago for testing
          .toISOString()
          .split("T")[0];

        for (const user of users) {
          const yesterdayTasks = await Task.find({
            user: user._id,
            date: yesterday,
          });

          // 🔹 STREAK RESET
          if (yesterdayTasks.length > 0) {
            const allDone = yesterdayTasks.every((t) => t.completed === true);
            if (!allDone) {
              user.streak = 0;
              console.log(`❌ ${user.name}'s streak reset (missed yesterday)`);
            }
          }

          // 🔹 TASK RESET
          if (yesterdayTasks.length > 0) {
            const todayTasks = await Task.find({
              user: user._id,
              date: today,
            });
            if (todayTasks.length === 0) {
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
          }

          await user.save();
        }

        console.log("✅ Daily streak + task reset complete.");
      } catch (err) {
        console.error("❌ Cron job error:", err);
      }
    });
  })
  .catch((err) => console.error("❌ MongoDB connection error:", err));
