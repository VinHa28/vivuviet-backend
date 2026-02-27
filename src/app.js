import express from "express";
import cors from "cors";
import routes from "./routes/index.js";

const app = express();

// Lấy danh sách origin từ .env, nếu không có thì mặc định là localhost
const allowedOrigins = process.env.CORS_ALLOWED_ORIGINS
  ? process.env.CORS_ALLOWED_ORIGINS.split(",")
  : ["http://localhost:3000", "http://localhost:5173"];

const corsOptions = {
  origin: (origin, callback) => {
    // 1. Cho phép các request không có origin (như Postman hoặc Server-to-Server)
    // 2. Kiểm tra xem origin có nằm trong danh sách trắng (allowedOrigins) không
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.error(`CORS Error: Origin ${origin} not allowed`);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 200, // Đảm bảo các trình duyệt cũ (IE11) không bị lỗi 204
};

app.use(cors(corsOptions));

// Middleware
app.use(express.json());

// Routes
app.use("/api", routes);

app.get("/", (req, res) => {
  res.send("API is running...");
});

export default app;
