import { uploadToCloudinary } from "../../middlewares/uploadMiddleware.js";
import { errorResponse, successResponse } from "../../utils/responseHelper.js";
import postModel from "./post.model.js";

export const getPartnerPosts = async (req, res) => {
  try {
    const posts = await postModel
      .find({ createdBy: req.user._id })
      .sort({ createdAt: -1 });

    return successResponse(res, posts, "Success", 200);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi khi lấy danh sách bài viết" });
  }
};

export const partnerCreatePost = async (req, res) => {
  try {
    const { destinationId, title, content, bannerTitle, bannerAlt } = req.body;

    if (!destinationId) {
      return errorResponse(res, "Địa điểm cho bài viết này là bắt buộc", 400);
    }

    if (!title || !content) {
      return errorResponse(res, "Tiêu đề và nội dung không được để trống", 400);
    }

    let bannerData = {
      title: bannerTitle || "",
      alt: bannerAlt || "",
      image: "",
    };

    if (req.files && req.files["bannerImage"]) {
      const result = await uploadToCloudinary(
        req.files["bannerImage"][0].buffer,
        "vivuviet/partners/banners",
      );
      bannerData.image = result.secure_url;
    }

    let galleryData = [];
    if (req.files && req.files["galleryImages"]) {
      const uploadPromises = req.files["galleryImages"].map((file, index) => {
        const altKey = `galleryAlt_${index}`;
        const altText = req.body[altKey] || "";
        return uploadToCloudinary(
          file.buffer,
          "vivuviet/partners/gallery",
        ).then((res) => ({
          image: res.secure_url,
          alt: altText,
        }));
      });

      galleryData = await Promise.all(uploadPromises);
    }

    const newPost = await postModel.create({
      destinationId,
      title,
      content,
      banner: bannerData,
      gallery: galleryData,
      postType: "partner",
      createdBy: req.user._id,
      status: "pending",
      postedDate: new Date(),
      relatedArticles: [],
    });

    return successResponse(
      res,
      newPost,
      "Gửi bài viết thành công. Vui lòng chờ quản trị viên phê duyệt",
      201,
    );
  } catch (error) {
    console.error("Partner Create Post Error:", error);
    return errorResponse(
      res,
      "Lỗi hệ thống khi đối tác tạo bài đăng",
      500,
      error.message,
    );
  }
};
