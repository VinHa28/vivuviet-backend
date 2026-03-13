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
import { uploadToCloudinary } from "../../middlewares/uploadMiddleware.js";
import cloudinary from "../../config/cloudinaryConfig.js";
import { getPublicIdFromUrl } from "../../utils/cloudinary.js";

// Stats
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

// Partner management
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

// Services
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

// Posts
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
      bannerTitle,
      bannerAlt,
      postedDate,
    } = req.body;

    if (!destinationId)
      return errorResponse(res, "Địa điểm cho bài viết này là bắt buộc", 400);

    if (!title || !content) {
      return errorResponse(res, "Tiêu đề và nội dung không được để trống", 400);
    }

    // Hanlde upload banner
    let bannerData = { title: bannerTitle, alt: bannerAlt, image: "" };

    if (req.files && req.files["bannerImage"]) {
      const result = await uploadToCloudinary(
        req.files["bannerImage"][0].buffer,
        "vivuviet/banners",
      );

      bannerData.image = result.secure_url;
    }

    let galleryData = [];
    if (req.files && req.files["galleryImages"]) {
      const uploadPromises = req.files["galleryImages"].map((file, index) => {
        const altKey = `galleryAlt_${index}`;
        const altText = req.body[altKey] || "";

        return uploadToCloudinary(file.buffer, "vivuviet/gallery").then(
          (res) => ({
            image: res.secure_url,
            alt: altText,
          }),
        );
      });
      galleryData = await Promise.all(uploadPromises);
    }

    // Save to database
    const createdBy = req.user._id;
    const postType = "system";

    const newPost = await postModel.create({
      destinationId,
      title,
      content,
      banner: bannerData,
      gallery: galleryData,
      postType,
      relatedArticles: [],
      postedDate: postedDate || new Date(),
      createdBy,
      status: "approved",
    });

    return successResponse(res, newPost, "Tạo bài viết thành công", 201);
  } catch (error) {
    return errorResponse(res, "Lỗi hệ thống khi tạo bài đăng", 500, error);
  }
};

export const updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      content,
      bannerTitle,
      bannerAlt,
      existingGallery, // Danh sách ảnh cũ khách muốn giữ lại (dạng chuỗi JSON)
      galleryAlts,
    } = req.body;

    // 1. Kiểm tra bài viết tồn tại
    const post = await postModel.findById(id);
    if (!post) {
      return errorResponse(res, "Không tìm thấy bài viết", 404);
    }

    // 2. Chuẩn bị dữ liệu cập nhật (Loại bỏ hoàn toàn destinationId)
    let updateData = {
      title: title || post.title,
      content: content || post.content,
    };

    // 3. Xử lý cập nhật Banner (nếu có file mới)
    if (req.files && req.files["bannerImage"]) {
      const result = await uploadToCloudinary(
        req.files["bannerImage"][0].buffer,
        "vivuviet/banners",
      );
      updateData.banner = {
        title: bannerTitle || post.banner.title,
        image: result.secure_url,
        alt: bannerAlt || post.banner.alt,
      };
    } else {
      // Nếu không upload ảnh mới, chỉ cập nhật text của banner
      updateData.banner = {
        ...post.banner,
        title: bannerTitle || post.banner.title,
        alt: bannerAlt || post.banner.alt,
      };
    }

    // 4. Xử lý Gallery
    // Phân tích danh sách ảnh cũ gửi từ FE (những ảnh người dùng không xóa)
    let updatedGallery = [];
    if (existingGallery) {
      updatedGallery = JSON.parse(existingGallery);
    }

    // Upload thêm ảnh mới vào mảng gallery (nếu có)
    if (req.files && req.files["galleryImages"]) {
      const newUploads = await Promise.all(
        req.files["galleryImages"].map((file, index) => {
          const altText = Array.isArray(galleryAlts)
            ? galleryAlts[index]
            : galleryAlts;
          return uploadToCloudinary(file.buffer, "vivuviet/gallery").then(
            (res) => ({
              image: res.secure_url,
              alt: altText || "",
            }),
          );
        }),
      );
      updatedGallery = [...updatedGallery, ...newUploads];
    }

    updateData.gallery = updatedGallery;

    // 5. Tiến hành cập nhật
    const updatedPost = await postModel.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true },
    );

    return successResponse(res, updatedPost, "Cập nhật bài viết thành công");
  } catch (error) {
    console.error("Update Post Error:", error);
    return errorResponse(res, "Lỗi khi cập nhật bài viết", 500, error.message);
  }
};

export const deletePost = async (req, res) => {
  try {
    const { id } = req.params;

    const post = await postModel.findById(id);
    if (!post) {
      return errorResponse(res, "Không tìm thấy bài đăng để xóa", 404);
    }

    const publicIdsToDelete = [];

    if (post.banner?.image) {
      const bannerId = getPublicIdFromUrl(post.banner.image);
      if (bannerId) publicIdsToDelete.push(bannerId);
    }

    if (post.gallery && post.gallery.length > 0) {
      post.gallery.forEach((item) => {
        const galleryId = getPublicIdFromUrl(item.image);
        if (galleryId) publicIdsToDelete.push(galleryId);
      });
    }

    if (publicIdsToDelete.length > 0) {
      await Promise.all(
        publicIdsToDelete.map((publicId) =>
          cloudinary.uploader.destroy(publicId),
        ),
      );
    }

    await postModel.findByIdAndDelete(id);

    return successResponse(
      res,
      null,
      "Đã xóa bài viết và toàn bộ hình ảnh liên quan",
    );
  } catch (error) {
    console.error(error);
    return errorResponse(res, "Lỗi khi xóa bài viết", 500, error.message);
  }
};

export const updatePostStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const validStatuses = ["pending", "approved", "rejected"];
    if (!validStatuses.includes(status)) {
      return errorResponse(res, "Trạng thái không hợp lệ", 400);
    }
    const updatedPost = await postModel.findByIdAndUpdate(
      id,
      {
        status: status,
      },
      {
        new: true,
        runValidators: true,
      },
    );
    if (!updatedPost) {
      return errorResponse(res, "Không tìm thấy bài đăng", 404);
    }
    const message =
      status === "approved" ? "Đã phê duyệt bài viết" : "Đã từ chối bài viết";
    return successResponse(res, updatedPost, message);
  } catch (error) {
    console.error(error);
    return errorResponse(res, "Lỗi khi cập nhật trạng thái", 500, error);
  }
};

// Destinations
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
