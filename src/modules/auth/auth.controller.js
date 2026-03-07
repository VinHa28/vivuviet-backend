import generateToken from "../../utils/generateToken.js";
import { successResponse, errorResponse } from "../../utils/responseHelper.js";
import userModel from "../user/user.model.js";
import { createNotificaiton } from "../notification/notification.service.js";

export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return errorResponse(res, "Email và mật khẩu là bắt buộc", 400);
    }

    const user = await userModel.findOne({ email });

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

    const user = await userModel.findOne({ email });

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
    const user = await userModel.findById(req.user._id).select("-password");

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

export const registerPartner = async (req, res) => {
  try {
    const {
      email,
      password,
      businessName,
      phone,
      website,
      fanpage,
      partnerTier,
    } = req.body;

    const existingUser = await userModel.findOne({
      $or: [{ email }, { phone }],
    });

    if (existingUser) {
      if (existingUser.email === email)
        return errorResponse(res, "Email này đã được sử dụng", 400);
      if (existingUser.phone === phone)
        return errorResponse(res, "Số điện thoại đã được sử dụng", 400);
    }

    const newUser = new userModel({
      email,
      password,
      businessName,
      phone,
      website,
      fanpage,
      partnerTier,
      registrationDate: new Date(),
    });

    await newUser.save();

    // Create notification for admin
    const admins = await userModel.find({ role: "admin" }).select("_id");

    const notifications = admins.map((admin) => ({
      recipient: admin._id,
      sender: newUser._id,
      title: "Đối tác mới đăng ký",
      message: `Đối tác ${businessName} vừa mới đăng ký gói ${partnerTier}`,
      type: "NEW_PARTNER",
      relatedId: newUser._id,
    }));

    await Promise.all(notifications.map((n) => createNotificaiton(n)));

    return successResponse(
      res,
      {
        user: {
          id: newUser._id,
          email: newUser.email,
          role: newUser.role,
          partnerTier: newUser.partnerTier,
          status: newUser.status,
        },
      },
      "Đăng ký thành công, hãy kiểm tra email của bạn!",
      201,
    );
  } catch (error) {
    console.error("Error registering partner:", error);
    return errorResponse(res, "Lỗi hệ thống", 500, error);
  }
};
