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
import destinationModel from "../destionation/destination.model.js";
import { sendApprovalEmail } from "../../utils/emailService.js";

export const approvePartner = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status } = req.body;
    const user = await userModel.findById(userId);
    if (!user) return errorResponse(res, "Đối tác này không tồn tại", 404);

    user.status = status;

    if (status === "active") {
      user.subscription.startDate = new Date();
    }

    await user.save();
    sendApprovalEmail(user.email, user.businessName, status).catch((err) =>
      console.error("Email error:", err),
    );
    return successResponse(
      res,
      { id: user._id, status: user.status },
      `Đã ${status === "active" ? "phê duyệt" : "từ chối"} đối tác thành công`,
    );
  } catch (error) {
    console.error("Approval error:", error);
    return errorResponse(res, "Lỗi hệ thống khi phê duyệt đối tác", 500, error);
  }
};

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

export const getAllPosts = async (req, res) => {
  try {
    const posts = await postModel
      .find()
      .populate("destinationId")
      .populate("createdBy");
    res.status(200).json(posts);
  } catch (error) {
    console.error(error);
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
      return errorResponse(res, "Tiêu đề và nội dung không được để trống", 400);
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

    return successResponse(res, newPost, "Tạo bài viết thành công", 201);
  } catch (error) {
    return errorResponse(res, "Lỗi hệ thống khi tạo bài đăng", 500, error);
  }
};

export const getPartnerDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const [partner, services, posts] = await Promise.all([
      userModel.findById(id).select("-password"),
      serviceModel.find({ partnerId: id }).populate("destination", "name"),
      postModel
        .find({ createdBy: id, postType: "partner" })
        .populate("destination", "name"),
    ]);

    if (!partner) return errorResponse(res, "Không tìm thấy đối tác", 404);

    const statistics = {
      services: {
        total: services.length,
        active: services.filter((s) => s.status === "approved").length,
        pending: services.filter((s) => s.status === "pending").length,
        totalViews: services.reduce((sum, s) => sum + (s.views || 0), 0),
      },
      posts: {
        total: posts.length,
        approved: posts.filter((p) => p.status === "approved").length,
        pending: posts.filter((p) => p.status === "pending").length,
      },
    };

    return res.status(200).json({
      partner,
      services,
      posts,
      statistics,
    });
  } catch (error) {
    return errorResponse(
      res,
      "Lỗi hệ thống khi lấy thông tin đối tác",
      500,
      error,
    );
  }
};

export const getDestinations = async (req, res) => {
  try {
    const destinations = await destinationModel.find();
    res.status(200).json({ destinations });
  } catch (error) {
    return errorResponse(
      res,
      "Lỗi hệ thống khi lấy thông danh sách tỉnh thành",
      500,
      error,
    );
  }
};

export const updateDestination = async (req, res) => {
  try {
    const { slug } = req.params;
    console.log(slug);
    const updateData = req.body;

    const updatingDestination = await destinationModel.findOne({ code: slug });
    if (!updatingDestination)
      return errorResponse(res, "Địa điểm này không tồn tại", 404);
    const updatedDestination = await destinationModel.findByIdAndUpdate(
      updatingDestination._id,
      { $set: updateData },
      { new: true, runValidators: true },
    );

    return successResponse(
      res,
      updatedDestination,
      "Cập nhật địa điểm thành công",
    );
  } catch (error) {
    return errorResponse(
      res,
      "Lỗi hệ thống khi lấy cập nhật thông tin tỉnh thành",
      500,
      error,
    );
  }
};
