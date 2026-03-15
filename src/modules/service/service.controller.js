import {
  deleteFromCloudinary,
  uploadToCloudinary,
} from "../../middlewares/uploadMiddleware.js";
import { getPublicIdFromUrl } from "../../utils/cloudinary.js";
import { errorResponse, successResponse } from "../../utils/responseHelper.js";
import serviceModel from "./service.model.js";

export const getAllServices = async (req, res) => {
  try {
    const services = await serviceModel.find();
    res.status(200).json(services);
  } catch (error) {
    res.status(500).json({ message: "Error fetching services", error });
  }
};

export const createPartnerService = async (req, res) => {
  try {
    const {
      name,
      linkAffiliate,
      type,
      description,
      highlights,
      priceFrom,
      priceTo,
      address,
      contactPhone,
      destination,
    } = req.body;

    const partnerId = req.user._id;

    let imageUrl = "";
    if (req.file) {
      const uploadResult = await uploadToCloudinary(req.file.buffer);
      imageUrl = uploadResult.secure_url;
    } else {
      return errorResponse(res, "Vui lòng cung cấp hình ảnh dịch vụ", 400);
    }

    const highlightData = Array.isArray(highlights)
      ? highlights
      : highlights
        ? [highlights]
        : [];

    const newService = new serviceModel({
      name,
      linkAffiliate,
      type,
      description,
      highlights: highlightData,
      image: imageUrl,
      priceFrom,
      priceTo,
      address,
      contactPhone,
      destination,
      partner: partnerId,
      status: "pending",
    });

    const savedService = await newService.save();

    return res.status(201).json({
      success: true,
      message: "Yêu cầu tạo dịch vụ đã được gửi và đang chờ duyệt.",
      data: savedService,
    });
  } catch (error) {
    console.error("Error at createPartnerService:", error);
    return errorResponse(res, "Có lỗi khi đăng ký dịch vụ", 500, error);
  }
};

export const deleteService = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const userRole = req.user.role;

    const service = await serviceModel.findById(id);

    if (!service) return errorResponse(res, "Không tìm thấy dịch vụ", 404);

    const isAdmin = userRole === "admin";
    const isOwner = service.partner.toString() === userId.toString();

    if (!isAdmin && !isOwner) {
      return errorResponse(res, "Bạn không có quyền xóa dịch vụ này", 403);
    }

    // --- LOGIC XÓA ẢNH TRÊN CLOUDINARY ---
    if (service.image) {
      const publicId = getPublicIdFromUrl(service.image);
      if (publicId) {
        await deleteFromCloudinary(publicId);
      }
    }
    // --------------------------------------

    await serviceModel.findByIdAndDelete(id);

    return successResponse(res, null, "Xóa dịch vụ thành công", 200);
  } catch (error) {
    console.error("Error at deleteService:", error);
    return errorResponse(res, "Có lỗi khi xóa dịch vụ", 500, error);
  }
};

export const updatePartnerService = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const userRole = req.user.role;

    const service = await serviceModel.findById(id);

    if (!service) {
      return errorResponse(res, "Không tìm thấy dịch vụ", 404);
    }

    if (
      userRole !== "admin" &&
      service.partner.toString() !== userId.toString()
    ) {
      return errorResponse(
        res,
        "Bạn không có quyền chỉnh sửa dịch vụ này",
        403,
      );
    }

    const updateData = { ...req.body };

    if (req.file) {
      if (service.image) {
        const oldPublicId = getPublicIdFromUrl(service.image);
        if (oldPublicId) {
          await deleteFromCloudinary(oldPublicId);
        }
      }
      const uploadResult = await uploadToCloudinary(req.file.buffer);
      updateData.image = uploadResult.secure_url;
    }

    const updatedService = await serviceModel.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true },
    );

    return successResponse(res, updatedService, "Cập nhật thành công", 200);
  } catch (error) {
    console.error("Error at updatePartnerService:", error);
    return errorResponse(res, "Có lỗi khi cập nhật dịch vụ", 500, error);
  }
};

export const getPartnerServices = async (req, res) => {
  try {
    const partnerId = req.user._id;

    const services = await serviceModel
      .find({ partner: partnerId })
      .populate("destination", "name")
      .sort({ createdAt: -1 });

    return successResponse(res, services, "Lấy danh sách thành công", 200);
  } catch (error) {
    console.error("Error at getPartnerServices:", error);
    return errorResponse(res, "Có lỗi khi lấy danh sách dịch vụ", 500, error);
  }
};
