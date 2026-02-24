import Service from "../service/service.model.js";
import Post from "../post/post.model.js";
import User from "../user/user.model.js";
import Destination from "../destionation/destination.model.js";
import {
  successResponse,
  errorResponse,
  paginatedResponse,
} from "../../utils/responseHelper.js";
import userModel from "../user/user.model.js";
import serviceModel from "../service/service.model.js";
import postModel from "../post/post.model.js";

export const adminGetServices = async (req, res) => {
  try {
    const { status, type, destinationId, page = 1, limit = 10 } = req.query;

    let query = {};

    if (status) query.status = status;
    if (type) query.type = type;
    if (destinationId) query.destination = destinationId;

    const skip = (page - 1) * limit;

    const services = await Service.find(query)
      .populate("partner", "businessName email partnerTier")
      .populate("destination", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Service.countDocuments(query);

    return paginatedResponse(
      res,
      services,
      { total, page: parseInt(page), limit: parseInt(limit) },
      "Lấy danh sách dịch vụ thành công",
    );
  } catch (error) {
    console.error("Error fetching services:", error);
    return errorResponse(res, "Lỗi khi lấy danh sách dịch vụ", 500, error);
  }
};

export const getAdminStats = async (req, res) => {
  try {
    const totalServices = await Service.countDocuments({ status: "approved" });
    const pendingServices = await Service.countDocuments({ status: "pending" });
    const totalPosts = await Post.countDocuments({ status: "approved" });
    const penddingPosts = await Post.countDocuments({ status: "pendding" });

    const activeDestinations = await Destination.countDocuments({
      isActive: true,
    });

    const totalUsers = await User.countDocuments({
      role: "partner",
      status: "active",
    });
    const pendingUsers = await User.countDocuments({
      role: "partner",
      status: "pending",
    });

    return successResponse(
      res,
      {
        services: {
          total: totalServices,
          pending: pendingServices,
        },
        posts: {
          total: totalPosts,
          pending: penddingPosts,
        },
        users: {
          total: totalUsers,
          pending: pendingUsers,
        },
        activeDestinations: activeDestinations,
      },
      "Lấy thống kê thành công",
    );
  } catch (error) {
    console.error("Error getting stats:", error);
    return errorResponse(res, "Lỗi khi lấy thống kê", 500, error);
  }
};

export const updateServiceStatus = async (req, res) => {
  try {
    const { serviceId } = req.params;
    const { status, rejectionReason } = req.body;

    const service = await Service.findById(serviceId);

    if (!service) {
      return errorResponse(res, "Không tìm thấy dịch vụ", 404);
    }

    service.status = status;

    if (status === "rejected" && rejectionReason) {
      service.rejectionReason = rejectionReason;
    }

    await service.save();

    return successResponse(
      res,
      service,
      `Dịch vụ đã được ${status === "approved" ? "duyệt" : "từ chối"}`,
    );
  } catch (error) {
    console.error("Error updating service status:", error);
    return errorResponse(
      res,
      "Lỗi khi cập nhật trạng thái dịch vụ",
      500,
      error,
    );
  }
};

export const getAllPartners = async (req, res) => {
  try {
    const partners = await User.aggregate([
      {
        $match: {
          role: "partner",
          status: { $ne: "banned" },
        },
      },
      {
        $lookup: {
          from: "services",
          let: { partnerId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$partner", "$$partnerId"] },
                status: "approved",
              },
            },
          ],
          as: "services",
        },
      },
      {
        $lookup: {
          from: "posts",
          let: { partnerId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$partner", "$$partnerId"] },
                postType: "partner",
                status: "approved",
              },
            },
          ],
          as: "posts",
        },
      },
      {
        $addFields: {
          totalServices: { $size: "$services" },
          totalPosts: { $size: "$posts" },
        },
      },
      {
        $project: {
          password: 0,
          services: 0,
          posts: 0,
        },
      },
      {
        $sort: { createdAt: -1 },
      },
    ]);

    res.status(200).json({
      count: partners.length,
      data: partners,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Lỗi hệ thống khi lấy danh sách Đối tác",
    });
  }
};

export const getPartnerStats = async (req, res) => {
  try {
    const { id } = req.params;
    const partnerInfo = await userModel.findById(id).select("-password");
    if (!partnerInfo)
      return res.status(404).json({ message: "Không tìm thấy đối tác này" });

    const [serviceStats, postStats] = await Promise.all([
      serviceModel.aggregate([
        { $match: { partner: partnerInfo._id } },
        {
          $group: {
            _id: null,
            totalServices: { $sum: 1 },
            activeServices: {
              $sum: { $cond: [{ $eq: ["$status", "approved"] }, 1, 0] },
            },
            pendingServices: {
              $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] },
            },
            totalViews: { $sum: "$views" },
            avgPrice: { $avg: "$priceFrom" },
          },
        },
      ]),

      postModel.aggregate([
        { $match: { createdBy: partnerInfo._id, postType: "partner" } },
        {
          $group: {
            _id: null,
            totalPosts: { $sum: 1 },
            approvedPosts: {
              $sum: { $cond: [{ $eq: ["$status", "approved"] }, 1, 0] },
            },
          },
        },
      ]),
    ]);

    const stats = {
      services: serviceStats[0] || {
        totalServices: 0,
        activeServices: 0,
        pendingServices: 0,
        totalViews: 0,
        avgPrice: 0,
      },
      posts: postStats[0] || {
        totalPosts: 0,
        approvedPosts: 0,
      },
    };
    res.status(200).json({
      success: true,
      partner: partnerInfo,
      statistics: stats,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Lỗi hệ thống khi lấy thông tin Đối tác",
    });
  }
};

export const getPartnerService = async (req, res) => {
  try {
    const { id } = req.params;
    const partner = await userModel.findById(id);
    if (!partner)
      return res.status(404).json({ message: "Đôi tác không tồn tại" });
    const services = await serviceModel.find({ partner: partner._id });
    res.status(200).json(services);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Lỗi hệ thống khi lấy thông tin đối tác",
    });
  }
};

export const getAllPosts = async (req, res) => {
  try {
    const posts = await postModel
      .find()
      .populate("destinationId")
      .populate("createdBy");
    res.status(200).json(posts);
  } catch (error) {
    console.log(error);
    res
      .statua(500)
      .json({ message: "Lỗi hệ thống khi lấy danh sách bài đăng" });
  }
};

export const createPost = async (req, res) => {
  try {
    const {
      destinationId,
      title,
      content,
      banner,
      gallery,
      relatedArticles,
      postedDate,
    } = req.body;

    if (!title || !content) {
      return res
        .status(400)
        .json({ message: "Tiêu đề và nội dung không được để trống" });
    }

    let createdBy = req.user._id;
    const postType = "system";
    const newPost = await postModel.create({
      destinationId: destinationId,
      title,
      content,
      banner,
      postType,
      createdBy,
      gallery,
      relatedArticles: [],
      postedDate: postedDate || new Date(),
      status: "approved",
    });

    res.status(201).json({
      message: "Tạo bài viết thành công",
      data: newPost,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Lỗi hệ thống khi tạo bài đăng", error: error.message });
  }
};
