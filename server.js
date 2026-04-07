const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const connectDB = require("./config/db");

dotenv.config();

const app = express();

// ── CORS ──────────────────────────────────────────────────────────
const allowedOrigins = [
  process.env.CLIENT_URL || "http://localhost:5173",  // Vite client
  process.env.ADMIN_URL  || "http://localhost:3001",  // CRA admin
  "http://localhost:3000",                             // CRA default
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, curl)
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
}));

app.use(express.json());

// Connect to MongoDB
connectDB();

// ── Routes ────────────────────────────────────────────────────────

// Public storefront
app.use("/api/auth",     require("./routes/authRoutes"));
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/categories", require("./routes/categoryRoutes"));
app.use("/api/banners",  require("./routes/bannerRoutes"));
app.use("/api/cart",     require("./routes/cartRoutes"));
app.use("/api/orders",   require("./routes/orderRoutes"));

// Admin
app.use("/api/staff",      require("./routes/staffRoutes"));
app.use("/api/dashboard",  require("./routes/dashboardRoutes"));
app.use("/api/attribute-variants", require("./routes/attributeVariantRoutes"));

// Legacy
app.use("/api/items", require("./routes/itemRoutes"));

// Health check
app.get("/", (req, res) => res.json({ message: "Matru Kripa API running", version: "2.0" }));

// ── Error Handler ────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ message: err.message || "Internal server error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
