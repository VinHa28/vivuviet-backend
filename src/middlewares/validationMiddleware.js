/**
 * Validation middleware for request body
 */

export const validatePartnerRequest = (req, res, next) => {
    const { email, password, businessName, phone, partnerTier } = req.body;

    const errors = [];

    if (!email || !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        errors.push("Email không hợp lệ");
    }

    if (!password || password.length < 6) {
        errors.push("Mật khẩu phải có ít nhất 6 ký tự");
    }

    if (!businessName || businessName.trim().length < 3) {
        errors.push("Tên doanh nghiệp phải có ít nhất 3 ký tự");
    }

    if (!phone || !phone.match(/^[0-9]{10,11}$/)) {
        errors.push("Số điện thoại không hợp lệ (10-11 chữ số)");
    }

    if (!["basic", "standard", "premium"].includes(partnerTier)) {
        errors.push("Gói đối tác không hợp lệ");
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: "Dữ liệu không hợp lệ",
            errors,
        });
    }

    next();
};

export const validateServiceUpdate = (req, res, next) => {
    const { status, rejectionReason } = req.body;

    if (!["approved", "rejected"].includes(status)) {
        return res.status(400).json({
            success: false,
            message: "Trạng thái không hợp lệ (approved hoặc rejected)",
        });
    }

    if (status === "rejected" && (!rejectionReason || rejectionReason.trim().length < 10)) {
        return res.status(400).json({
            success: false,
            message: "Lý do từ chối phải có ít nhất 10 ký tự",
        });
    }

    next();
};

export const validatePartnerUpdate = (req, res, next) => {
    const { status, rejectionReason } = req.body;

    if (!["active", "rejected"].includes(status)) {
        return res.status(400).json({
            success: false,
            message: "Trạng thái không hợp lệ (active hoặc rejected)",
        });
    }

    if (status === "rejected" && (!rejectionReason || rejectionReason.trim().length < 10)) {
        return res.status(400).json({
            success: false,
            message: "Lý do từ chối phải có ít nhất 10 ký tự",
        });
    }

    next();
};
