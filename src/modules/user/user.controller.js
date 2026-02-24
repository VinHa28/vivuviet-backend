import userModel from "./user.model.js";
import { successResponse, errorResponse } from "../../utils/responseHelper.js";

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
