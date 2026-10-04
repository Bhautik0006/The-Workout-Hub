const path = require("path");
const fs = require("fs");
const dotenv = require("dotenv");

// Load environment variables early
dotenv.config({ path: path.join(__dirname, ".env") });

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const userRoutes = require("./routes/userRoutes");
const templateRoutes = require("./routes/templateRoutes");
const exerciseRoutes = require("./routes/exerciseRoutes");
const workoutRoutes = require("./routes/workoutRoutes");
const progressRoutes = require("./routes/progressRoutes");
const shareRoutes = require("./routes/shareRoutes");
const achievementRoutes = require("./routes/achievementRoutes");

const app = express();

// Middleware
app.use(express.json());

// CORS configuration
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5000",
  "http://localhost:3000",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5000",
  ...(process.env.CLIENT_URL ? [process.env.CLIENT_URL] : [])
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, same-origin) or in allowed list
      if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== "production") {
        return callback(null, true);
      }
      return callback(new Error("CORS policy violation: origin not allowed"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
  })
);

// Connect to MongoDB
connectDB();

// Test / Health check route
app.get("/api/test", (req, res) => {
  res.json({
    status: "ok",
    message: "Frontend connected to backend successfully!",
    environment: process.env.NODE_ENV || "development"
  });
});

// Main API routes
app.use("/api/users", userRoutes);
app.use("/api/templates", templateRoutes);
app.use("/api/exercises", exerciseRoutes);
app.use("/api/workouts", workoutRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/shares", shareRoutes);
app.use("/api/achievements", achievementRoutes);

// 404 handler for unmatched API routes
app.use((req, res, next) => {
  if (req.path.startsWith("/api")) {
    return res.status(404).json({ error: `Cannot ${req.method} ${req.originalUrl}` });
  }
  next();
});

// Serve frontend in production or if build dist exists
const frontendDist = path.join(__dirname, "../frontend/dist");
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));

  // SPA fallback for all GET navigation routes
  app.use((req, res, next) => {
    if (req.method === "GET" && !req.path.startsWith("/api")) {
      return res.sendFile(path.join(frontendDist, "index.html"));
    }
    next();
  });
} else {
  // Root route fallback when frontend dist is not built
  app.get("/", (req, res) => {
    res.send("Workout Hub Backend is running. Run 'npm run build' in root to build the frontend.");
  });
}

// Global error handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(err.status || 500).json({
    error: err.message || "Internal server error"
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});