import jwt from "jsonwebtoken";
import User from "../modules/user/user.model.js";

// Protect routes
export const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization?.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        message: "Không có token, truy cập bị từ chối",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({
        message: "Người dùng không tồn tại",
      });
    }

    req.user = user;

    next();
  } catch (error) {
    console.error("Auth error:", error.message);

    return res.status(401).json({
      message: "Token không hợp lệ hoặc đã hết hạn",
    });
  }
};

// Admin only middleware
export const adminOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      message: "Chưa xác thực",
    });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({
      message: "Chỉ admin mới có quyền truy cập",
    });
  }

  next();
};
