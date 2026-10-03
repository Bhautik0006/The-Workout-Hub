

const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");

const userRoutes = require("./routes/userRoutes");
const templateRoutes = require("./routes/templateRoutes");
const exerciseRoutes = require("./routes/exerciseRoutes");
const workoutRoutes = require("./routes/workoutRoutes");
const progressRoutes = require("./routes/progressRoutes");
const shareRoutes = require("./routes/shareRoutes");

dotenv.config();

const app = express();

// Middleware
app.use(express.json());

// Allow React frontend to communicate with backend
app.use(
    cors({
        origin: "http://localhost:5173",
        methods: ["GET", "POST", "PUT", "DELETE"],
        credentials: true
    })
);

// Connect to MongoDB
connectDB();

// Test route
app.get("/api/test", (req, res) => {
    res.json({
        message: "Frontend connected to backend successfully!"
    });
});

// Main API routes
app.use("/api/users", userRoutes);
app.use("/api/templates", templateRoutes);
app.use("/api/exercises", exerciseRoutes);
app.use("/api/workouts", workoutRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/shares", shareRoutes);

// Root route
app.get("/", (req, res) => {
    res.send("Workout Hub Backend is running");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});