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

    const [user, totalServices, totalPosts, serviceViewsAggregate] =
      await Promise.all([
        userModel.findById(userId).select("-password"),
        serviceModel.countDocuments({ partner: userId }),
        postModel.countDocuments({ createdBy: userId, postType: "partner" }),
        serviceModel.aggregate([
          { $match: { partner: userId } },
          { $group: { _id: null, totalViews: { $sum: "$views" } } },
        ]),
      ]);

    if (!user) {
      return errorResponse(res, "Không tìm thấy người dùng", 404);
    }

    const totalViews =
      serviceViewsAggregate.length > 0
        ? serviceViewsAggregate[0].totalViews
        : 0;

    return successResponse(
      res,
      {
        profile: user,
        stats: {
          totalServices,
          totalPosts,
          totalViews,
        },
      },
      "Lấy dữ liệu Dashboard thành công",
      200,
    );
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return errorResponse(res, "Lỗi hệ thống", 500, error);
  }
};
