import express from "express";
import cors from "cors";
import routes from "./routes/index.js";

const app = express();

// --- Tối ưu CORS ---
const allowedOrigins = process.env.CORS_ALLOWED_ORIGINS?.split(",") || [
  "http://localhost:3000",
  "http://localhost:5173",
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Cho phép requests không origin (Postman) hoặc trong whitelist
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS Error: Origin ${origin} not allowed`));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// --- Middleware ---
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Thêm cái này để xử lý form data truyền thống

// --- Routes ---
app.use("/api", routes);

app.get("/", (req, res) => {
  res.status(200).json({ message: "API is running...", status: "OK" });
});

// --- Error Handling Middleware (Quan trọng để app không bị crash) ---
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

export default app;
