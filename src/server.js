import "./config/env.js"; // Dòng này phải nằm trên cùng
import app from "./app.js";
import connectDB from "./config/db.js";
import { transporter } from "./config/emailConfig.js";
import cloudinary from "./config/cloudinaryConfig.js";

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // 1. Kết nối Database
    await connectDB();
    console.log("✅ Database Connected");

    // 2. Kiểm tra Cloudinary (Tích hợp từ câu hỏi trước)
    const cloudCheck = await cloudinary.api.ping();
    console.log("✅ Cloudinary Ready:", cloudCheck.status);

    // 3. Kiểm tra Email
    await transporter.verify();
    console.log("✅ SMTP Ready");

    // 4. Khởi chạy Server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Critical Boot Error:", error.message);
    process.exit(1); // Dừng server nếu lỗi nghiêm trọng
  }
};

startServer();
