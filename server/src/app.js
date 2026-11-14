import express from "express";
import cors from "cors";
import productRoutes from "./routes/productRoutes.js";
import outletRoutes from "./routes/outletRoutes.js";
import memberRoutes from "./routes/memberRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health Check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "MemberKu CRM API Server is running!" });
});

// Routes API
app.use("/api/products", productRoutes);
app.use("/api/outlets", outletRoutes);
app.use("/api/members", memberRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Endpoint tidak ditemukan" });
});

export default app;

