//1. Task Model (models/Task.js)

let mongoose = require("mongoose");

let taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  deadline: { type: Date, required: true }, // Store deadline as Date
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Task", taskSchema);
//2. Schedule Cleanup Job (cronJobs/cleanupTasks.js)

let cron = require("node-cron");
let Task = require("../models/Task");
let mongoose = require("mongoose");
require("dotenv").config();

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Cron job: Runs every 5 minutes
cron.schedule("*/5 * * * *", async () => {
  try {
    let now = new Date();
    let expiredTasks = await Task.find({ deadline: { $lt: now } });

    if (expiredTasks.length > 0) {
      await Task.deleteMany({ deadline: { $lt: now } });
      console.log(`Deleted ${expiredTasks.length} expired tasks at ${now}`);
    } else {
      console.log("No expired tasks found.");
    }
  } catch (error) {
    console.error("Error during task cleanup:", error);
  }
});
//3. Running the Cron Job in server.js

require("./cronJobs/cleanupTasks"); // Import the cron job file

let express = require("express");
let mongoose = require("mongoose");
let dotenv = require("dotenv");

dotenv.config();

let app = express();
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.get("/", (req, res) => {
  res.send("Task Tracker System Running...");
});

let PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
//4. Testing

{
  "title": "Complete Report",
  "description": "Finish the monthly report",
  "deadline": "2025-02-16T15:10:00Z"
}
