const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

require("./models/Student");

require("./scripts/busSimulator").startSimulator();

const app = express();

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
  }),
);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// Your existing routes
const announcementRoutes = require("./routes/announcementRoutes");
app.use("/api/announcements", announcementRoutes);

const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);

const adminAuthRoutes = require("./routes/adminAuthRoutes");
app.use("/api/admin/auth", adminAuthRoutes);

const lostFoundRoutes = require("./routes/lostFoundRoutes");
app.use("/api/lostfound", lostFoundRoutes);

const notificationRoutes = require("./routes/notificationRoutes");
app.use("/api/notifications", notificationRoutes);

// Teammate's routes
const feedbackRoutes = require("./routes/feedbackRoutes");
app.use("/api/feedbacks", feedbackRoutes);

const routeRoutes = require("./routes/routeRoutes");
app.use("/api/routes", routeRoutes);

const stoppageRoutes = require("./routes/stoppageRoutes");
app.use("/api/stoppages", stoppageRoutes);

const busRoutes = require("./routes/busRoutes");
app.use("/api/buses", busRoutes);

// ishika-junnabi
const bookingRoutes = require("./routes/bookingRoutes");
app.use("/api/bookings", bookingRoutes);

const planRoutes = require("./routes/planRoutes");
app.use("/api/plans", planRoutes);

const scheduleRoutes = require("./routes/scheduleRoutes");
app.use("/api/schedules", scheduleRoutes);

const studentRoutes = require("./routes/studentRoutes");
app.use("/api/students", studentRoutes);

const fareRoutes = require("./routes/fareRoutes");
app.use("/api/fare", fareRoutes);

const paymentRoutes = require("./routes/paymentRoutes");
app.use("/api/payment", paymentRoutes);

const reportRoutes = require("./routes/reportRoutes");
app.use("/api/reports", reportRoutes);

const sosRoutes = require("./routes/sosRoutes");
app.use("/api/sos", sosRoutes);

const busLocationRoutes = require("./routes/busLocationRoutes");
app.use("/api/bus-locations", busLocationRoutes);

require("./scripts/busSimulator"); // loads the module
app.get("/", (req, res) => res.json({ message: "Bracu Bus API is running!" }));

const PORT = process.env.PORT || 9255;

async function startServer() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      family: 4,
    });
    console.log("MongoDB connected!");
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

    const { startSimulator } = require("./scripts/busSimulator");
    startSimulator();
  } catch (err) {
    console.log("Connection error:", err.message);
  }
}

startServer();
