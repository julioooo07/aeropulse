const path = require("path");
const fs = require("fs");
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const helmet = require("helmet");
const morgan = require("morgan");
const env = require("./config/env");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const productRoutes = require("./routes/productRoutes");
const reorderRoutes = require("./routes/reorderRoutes");
const serviceRequestRoutes = require("./routes/serviceRequestRoutes");
const orderRoutes = require("./routes/orderRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const taskRoutes = require("./routes/taskRoutes");
const inventoryChangeRequestRoutes = require("./routes/inventoryChangeRequestRoutes");
const restockOrderRoutes = require("./routes/restockOrderRoutes");
const reportRoutes = require("./routes/reportRoutes");
const aiRoutes = require("./routes/aiRoutes");
const inventoryAlertRoutes = require("./routes/inventoryAlertRoutes");
const { handleValidationError } = require("./middleware/validation");

const app = express();

const normalizeOrigin = (value) => String(value || "").trim().replace(/\/+$/, "");

const isTrustedDeployOrigin = (origin) => {
  try {
    const { protocol, hostname } = new URL(origin);
    if (!["http:", "https:"].includes(protocol)) return false;

    return (
      hostname.endsWith(".onrender.com") ||
      hostname.endsWith(".vercel.app") ||
      hostname.endsWith(".netlify.app")
    );
  } catch (_error) {
    return false;
  }
};

app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests without origin (server-to-server or same-origin)
      if (!origin) return callback(null, true);

      const requestOrigin = normalizeOrigin(origin);

      // In development, allow any localhost origin (covers Expo web ports)
      if (
        env.nodeEnv !== "production" &&
        /https?:\/\/localhost(:\d+)?/.test(requestOrigin)
      ) {
        return callback(null, true);
      }

      // Otherwise allow only configured origins
      const configured = Array.isArray(env.corsOrigin) ? env.corsOrigin : [env.corsOrigin];
      const allowed = new Set(
        [
          ...configured,
          env.frontendUrl, // always allow the explicitly configured frontend
        ]
          .map(normalizeOrigin)
          .filter(Boolean),
      );

      // If we're in production and nothing is configured, don't brick the API.
      // Render domains and deployed frontends vary; allow all until env vars are set.
      if (env.nodeEnv === "production" && allowed.size === 0) {
        console.warn(
          "[CORS] No allowed origins configured in production. " +
            "Set FRONTEND_URL and/or CORS_ORIGIN. Temporarily allowing all origins.",
        );
        return callback(null, true);
      }

      // Support "allow all" when explicitly configured (useful for quick Render fixes)
      if (allowed.has("*")) return callback(null, true);

      if (allowed.has(requestOrigin)) return callback(null, true);

      // Render/Vercel/Netlify preview URLs can change between deploys.
      // Trust those deploy hostnames so the API stays reachable after redeploys.
      if (env.nodeEnv === "production" && isTrustedDeployOrigin(requestOrigin)) {
        return callback(null, true);
      }

      console.warn(`[CORS] Blocked origin: ${requestOrigin}`);
      // Don't throw an Error (which becomes a 500 + stack trace). Just deny CORS.
      return callback(null, false);
    },
    credentials: true,
  }),
);
app.use(morgan("dev"));

// Switch to express-session for server-side persistence
// This ensures server restarts wipe all sessions (default in-memory store)
app.use(
  session({
    name: "aeropulse.sid",
    secret: env.jwtSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      httpOnly: true,
      secure: env.nodeEnv === "production",
      sameSite: "lax",
    },
  }),
);

app.use(cookieParser(env.jwtSecret));
app.use(express.json({ limit: "5mb" }));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/products", productRoutes);
app.use("/api/reorders", reorderRoutes);
app.use("/api/service-requests", serviceRequestRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/inventory-change-requests", inventoryChangeRequestRoutes);
app.use("/api/inventory-alerts", inventoryAlertRoutes);
app.use("/api/restock-orders", restockOrderRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/ai", aiRoutes);
app.use(handleValidationError);

const buildPath = path.resolve(__dirname, "..", "..", "front", "build");
const indexHtml = path.join(buildPath, "index.html");

if (fs.existsSync(indexHtml)) {
  app.use(express.static(buildPath));

  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api/")) {
      return next();
    }
    res.sendFile(indexHtml);
  });
}

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: "Internal server error" });
});

module.exports = app;
