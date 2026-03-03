import dotenv from "dotenv";
import app from "./app.js";
import connectDB from "./config/db.js";

// Xác định môi trường
const env = process.env.NODE_ENV || "development";

// Load đúng file env
dotenv.config({
  path: `.env.${env}`,
});

const PORT = process.env.PORT || 5000;

await connectDB();

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT} in ${env} mode`);
});
