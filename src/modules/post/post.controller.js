import { uploadToCloudinary } from "../../middlewares/uploadMiddleware.js";
import { errorResponse, successResponse } from "../../utils/responseHelper";
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

export const createPostByPartner = async (req, res) => {
  try {
    const {
      destinationId,
      title,
      content,
      bannerTitle,
      bannerAlt,
      galleryAlts,
    } = req.body;

    if (!destinationId)
      return errorResponse(res, "Địa điểm cho bài viết này là bắt buộc", 400);

    if (!title || !content) {
      return errorResponse(res, "Tiêu đề và nội dung không được để trống", 400);
    }

    let bannerData = { title: bannerTitle, alt: bannerAlt, image: "" };

    if (req.files && req.files["bannerImage"]) {
      const result = await uploadToCloudinary(
        req.files["bannerImage"][0].buffer,
        "vivuviet/banners",
      );

      bannerData.image = result.secure_url;
    }

    let galleryData = [];
    if (res.files && res.files["galleryImages"]) {
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

    const createdBy = req.user._id;
    const postType = "partner";
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
      status: "pending",
    });

    return successResponse(res, newPost, "Tạo bài viết thành công", 201);
  } catch (error) {
    console.error(error);
    return errorResponse(res, "Lỗi khi tạo bài đăng", 500, error);
  }
};
