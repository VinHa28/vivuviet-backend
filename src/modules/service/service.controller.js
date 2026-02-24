import serviceModel from "./service.model.js";

export const createPartnerService = async (req, res) => {
  try {
    const {
      name,
      linkAffiliate,
      type,
      description,
      highlights,
      images,
      priceFrom,
      priceTo,
      address,
      contactPhone,
      destination,
    } = req.body;

    const partnerId = req.user._id;

    const newService = new serviceModel({
      name,
      linkAffiliate,
      type,
      description,
      highlights,
      images,
      priceFrom,
      priceTo,
      address,
      contactPhone,
      destination,
      partner: partnerId,
      status: "pending",
      isPriority: false,
      isFeatured: false,
    });

    await newService.save();

    res.status(201).json({
      success: true,
      message: "Gửi đề xuất dịch vụ thành công. Vui lòng chờ Admin phê duyệt.",
      data: savedService,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi khi tạo dịch vụ",
      error: error.message,
    });
  }
};
