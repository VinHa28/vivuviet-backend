import userModel from "./user.model.js";
import { successResponse, errorResponse } from "../../utils/responseHelper.js";
import serviceModel from "../service/service.model.js";
import postModel from "../post/post.model.js";

export const getAllUsers = async (req, res) => {
  try {
    const { role, tier, search } = req.query;
    let query = {};

    if (role) query.role = role;
    if (tier) query.partnerTier = tier;

    if (search) {
      query.$or = [
        { businessName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const users = await userModel
      .find(query)
      .select("-password")
      .sort({ createdAt: -1 });

    return successResponse(res, users, "Lấy danh sách người dùng thành công");
  } catch (error) {
    console.error("Error getting users:", error);
    return errorResponse(res, "Lỗi hệ thống", 500, error);
  }
};

export const getPartnersPremium = async (req, res) => {
  try {
    const users = await userModel
      .find({ partnerTier: "premium", role: "partner" })
      .select("-password")
      .sort({ priorityRate: -1 });
    return successResponse(res, users, "Lấy danh sách người dùng thành công");
  } catch (error) {
    console.error("Error getting users:", error);
    return errorResponse(res, "Lỗi hệ thống", 500, error);
  }
};

export const getPartnerDashboardData = async (req, res) => {
  try {
    const userId = req.user._id;

    // Truy vấn song song để tiết kiệm thời gian
    const [user, services, posts] = await Promise.all([
      userModel.findById(userId).select("-password"), // Lấy profile (bỏ password)
      serviceModel.find({ partner: userId }).sort({ createdAt: -1 }), // Lấy danh sách dịch vụ
      postModel
        .find({ createdBy: userId, postType: "partner" })
        .sort({ createdAt: -1 }), // Lấy danh sách bài đăng
    ]);

    if (!user) {
      return errorResponse(res, "Không tìm thấy người dùng", 404);
    }

    // Trả về tổng hợp dữ liệu cho Dashboard
    return successResponse(
      res,
      {
        profile: user,
        services: services,
        posts: posts,
        stats: {
          totalServices: services.length,
          totalPosts: posts.length,
          activeServices: services.filter((s) => s.status === "approved")
            .length,
          pendingServices: services.filter((s) => s.status === "pending")
            .length,
        },
      },
      "Lấy dữ liệu Dashboard thành công",
    );
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return errorResponse(res, "Lỗi hệ thống", 500, error);
  }
};
