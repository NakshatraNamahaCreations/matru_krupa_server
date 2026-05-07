const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const dotenv = require("dotenv");
const path = require("path");
const connectDB = require("./config/db");

dotenv.config();

const app = express();

// ── CORS ──────────────────────────────────────────────────────────
const parseOrigins = (raw) =>
  (raw || "")
    .split(",")
    .map((o) => o.trim().replace(/\/$/, ""))
    .filter((o) => /^https?:\/\//.test(o));

const allowedOrigins = [
  // Local dev
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:5173",
  // Known production origins (safety net if env vars are missing)
  "https://matru-krupa-admin.vercel.app",
  "https://matrukrupa.vercel.app",
  "https://matrugrupa.netlify.app",
  // From env (comma-separated, with or without scheme normalized)
  ...parseOrigins(process.env.CLIENT_URL),
  ...parseOrigins(process.env.ADMIN_URL),
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, curl)
      if (!origin) return callback(null, true);
      const normalized = origin.replace(/\/$/, "");
      if (allowedOrigins.includes(normalized)) return callback(null, true);
      callback(new Error(`CORS blocked: ${origin}`));
    },
    credentials: true,
  }),
);

app.use(morgan("dev"));
app.use(express.json());

// Connect to MongoDB
connectDB();

// ── Routes ────────────────────────────────────────────────────────

// Public storefront
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/categories", require("./routes/categoryRoutes"));
app.use("/api/banners", require("./routes/bannerRoutes"));
app.use("/api/cart", require("./routes/cartRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));

// Admin
app.use("/api/staff", require("./routes/staffRoutes"));
app.use("/api/dashboard", require("./routes/dashboardRoutes"));
app.use("/api/attribute-variants", require("./routes/attributeVariantRoutes"));

// Hierarchy / Commission
app.use("/api/hierarchy", require("./routes/hierarchyRoutes"));

// Inventory / Warehouse
app.use("/api/inventory", require("./routes/inventoryRoutes"));

// Pricing
app.use("/api/pricing", require("./routes/pricingRoutes"));

// Legacy
app.use("/api/items", require("./routes/itemRoutes"));


// Health check
app.get("/", (req, res) =>
  res.json({ message: "Matru Kripa API running", version: "2.0" }),
);

// ── Error Handler ────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res
    .status(err.status || 500)
    .json({ message: err.message || "Internal server error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

module.exports = app;
