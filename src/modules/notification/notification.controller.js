import { errorResponse, successResponse } from "../../utils/responseHelper.js";
import notificationModel from "./notification.model.js";

export const getNotifications = async (req, res) => {
  try {
    const userId = req.user._id;

    const notifications = await notificationModel
      .find({ recipient: userId })
      .populate("sender", "email businessName logo")
      .sort({ createdAt: -1 });

    const unreadCount = await notificationModel.countDocuments({
      recipient: userId,
      isRead: false,
    });

    return successResponse(res, {
      notifications,
      unreadCount,
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return errorResponse(res, "Lỗi hệ thống", 500, error);
  }
};
