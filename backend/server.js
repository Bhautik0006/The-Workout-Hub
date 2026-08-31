const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db"); // Import your DB helper

const userRoutes = require("./routes/userRoutes");
const templateRoutes = require("./routes/templateRoutes");
const exerciseRoutes = require("./routes/exerciseRoutes");
const workoutRoutes = require("./routes/workoutRoutes");
const progressRoutes = require("./routes/progressRoutes");

dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

app.use(express.json());

// Routes
app.use("/api/users", userRoutes);
app.use("/api/templates", templateRoutes);
app.use("/api/exercises", exerciseRoutes);
app.use("/api/workouts", workoutRoutes);
app.use("/api/progress", progressRoutes);

app.get("/", (req, res) => {
    res.send("Backend is running");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});