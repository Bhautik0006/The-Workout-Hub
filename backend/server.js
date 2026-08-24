const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

const userRoutes = require("./routes/userRoutes");
const templateRoutes = require("./routes/templateRoutes");
const exerciseRoutes = require("./routes/exerciseRoutes");
const workoutRoutes = require("./routes/workoutRoutes");
const progressRoutes = require("./routes/progressRoutes");

dotenv.config();

const app = express();

app.use(express.json());

// Routes
app.use("/api/users", userRoutes);
app.use("/api/templates", templateRoutes);
app.use("/api/exercises", exerciseRoutes);
app.use("/api/workouts", workoutRoutes);
app.use("/api/progress", progressRoutes);

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB connected");
    })
    .catch((err) => {
        console.log("MongoDB connection error:", err);
    });

app.get("/", (req, res) => {
    res.send("Backend is running");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});