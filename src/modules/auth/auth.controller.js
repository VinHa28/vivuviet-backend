import User from "../user/user.model.js";
import generateToken from "../../utils/generateToken.js";
import { successResponse, errorResponse } from "../../utils/responseHelper.js";

export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return errorResponse(res, "Email và mật khẩu là bắt buộc", 400);
    }

    const user = await User.findOne({ email });

    if (!user)
      return errorResponse(res, "Thông tin đăng nhập không chính xác", 400);
    if (user.role !== "admin")
      return errorResponse(res, "Chỉ quản trị viên mới có thể đăng nhập", 403);

    const isMatch = await user.comparePassword(password);
    if (!isMatch)
      return errorResponse(res, "Email hoặc mật khẩu không chính xác", 401);

    const token = generateToken(user);

    return successResponse(res, {
      token,
      user: { email: user.email, role: user.role, logo: user.logo },
    });
  } catch (error) {
    console.error("Login error:", error);
    return errorResponse(res, "Lỗi hệ thống", 500, error);
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return errorResponse(res, "Email và mật khẩu là bắt buộc", 400);
    }

    const user = await User.findOne({ email });

    if (!user) {
      return errorResponse(res, "Email hoặc mật khẩu không chính xác", 401);
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return errorResponse(res, "Email hoặc mật khẩu không chính xác", 401);
    }

    const token = generateToken(user);

    return successResponse(
      res,
      {
        token,
        user: {
          _id: user._id,
          email: user.email,
          role: user.role,
          partnerTier: user.partnerTier,
          isPartnerActive: user.isPartnerActive,
          businessName: user.businessName,
          phone: user.phone,
          website: user.website,
          fanpage: user.fanpage,
        },
      },
      "Đăng nhập thành công",
    );
  } catch (error) {
    console.error("Login error:", error);
    return errorResponse(res, "Lỗi hệ thống", 500, error);
  }
};

// Get current user info (refresh user data)
export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");

    if (!user) {
      return errorResponse(res, "Không tìm thấy người dùng", 404);
    }

    return successResponse(
      res,
      {
        user: {
          _id: user._id,
          email: user.email,
          role: user.role,
          partnerTier: user.partnerTier,
          isPartnerActive: user.isPartnerActive,
          businessName: user.businessName,
          phone: user.phone,
          website: user.website,
          fanpage: user.fanpage,
        },
      },
      "Lấy thông tin người dùng thành công",
    );
  } catch (error) {
    console.error("Error getting current user:", error);
    return errorResponse(res, "Lỗi hệ thống", 500, error);
  }
};

