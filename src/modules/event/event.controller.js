import eventModel from "./event.model.js";

/**
 * Lấy tất cả sự kiện với lọc theo tháng
 * Query parameters: month (0-11), status, isActive
 */
export const getAllEvents = async (req, res) => {
    try {
        const { month, status, isActive } = req.query;

        let filter = {};

        if (isActive === "false") {
            filter.isActive = false;
        } else {
            filter.isActive = true;
        }

        if (status) {
            filter.status = status;
        }

        const events = await eventModel.find(filter).sort({ startDate: 1 });

        if (month !== undefined) {
            const monthNum = parseInt(month);
            if (monthNum >= 0 && monthNum <= 11) {
                const filteredEvents = events.filter((event) => {
                    const startMonth = event.startDate.getMonth();
                    const endMonth = event.endDate.getMonth();
                    return monthNum >= startMonth && monthNum <= endMonth;
                });
                return res.status(200).json({
                    success: true,
                    data: filteredEvents,
                    total: filteredEvents.length,
                });
            }
        }

        res.status(200).json({
            success: true,
            data: events,
            total: events.length,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Lỗi khi lấy danh sách sự kiện",
            error: error.message,
        });
    }
};

/**
 * Lấy chi tiết một sự kiện theo ID
 */
export const getEventById = async (req, res) => {
    try {
        const { id } = req.params;
        const event = await eventModel.findById(id);

        if (!event) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy sự kiện này",
            });
        }

        res.status(200).json({
            success: true,
            data: event,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Lỗi khi lấy chi tiết sự kiện",
            error: error.message,
        });
    }
};

/**
 * Tạo sự kiện mới (Admin only)
 */
export const createEvent = async (req, res) => {
    try {
        const { title, description, image, startDate, endDate, location } =
            req.body;

        // Validation
        if (!title || !description || !image || !startDate || !endDate || !location) {
            return res.status(400).json({
                success: false,
                message: "Vui lòng cung cấp tất cả thông tin bắt buộc",
            });
        }

        const start = new Date(startDate);
        const end = new Date(endDate);

        if (end <= start) {
            return res.status(400).json({
                success: false,
                message: "Ngày kết thúc phải sau ngày bắt đầu",
            });
        }

        const newEvent = new eventModel({
            title,
            description,
            image,
            startDate: start,
            endDate: end,
            location,
        });

        await newEvent.save();

        res.status(201).json({
            success: true,
            message: "Tạo sự kiện thành công",
            data: newEvent,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Lỗi khi tạo sự kiện",
            error: error.message,
        });
    }
};

/**
 * Cập nhật sự kiện (Admin only)
 */
export const updateEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, image, startDate, endDate, location, status, isActive } =
            req.body;

        // Validation cho dates nếu được cập nhật
        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            if (end <= start) {
                return res.status(400).json({
                    success: false,
                    message: "Ngày kết thúc phải sau ngày bắt đầu",
                });
            }
        }

        const event = await eventModel.findByIdAndUpdate(
            id,
            {
                ...(title && { title }),
                ...(description && { description }),
                ...(image && { image }),
                ...(startDate && { startDate: new Date(startDate) }),
                ...(endDate && { endDate: new Date(endDate) }),
                ...(location && { location }),
                ...(status && { status }),
                ...(isActive !== undefined && { isActive }),
            },
            { new: true, runValidators: true }
        );

        if (!event) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy sự kiện này",
            });
        }

        res.status(200).json({
            success: true,
            message: "Cập nhật sự kiện thành công",
            data: event,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Lỗi khi cập nhật sự kiện",
            error: error.message,
        });
    }
};

/**
 * Xóa sự kiện (Admin only) - Soft delete
 */
export const deleteEvent = async (req, res) => {
    try {
        const { id } = req.params;

        const event = await eventModel.findByIdAndUpdate(
            id,
            { isActive: false },
            { new: true }
        );

        if (!event) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy sự kiện này",
            });
        }

        res.status(200).json({
            success: true,
            message: "Xóa sự kiện thành công",
            data: event,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Lỗi khi xóa sự kiện",
            error: error.message,
        });
    }
};

/**
 * Lấy sự kiện sắp tới (Upcoming events)
 */
export const getUpcomingEvents = async (req, res) => {
    try {
        const now = new Date();
        const events = await eventModel
            .find({
                startDate: { $gte: now },
                isActive: true,
            })
            .sort({ startDate: 1 })
            .limit(10);

        res.status(200).json({
            success: true,
            data: events,
            total: events.length,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Lỗi khi lấy sự kiện sắp tới",
            error: error.message,
        });
    }
};

/**
 * Lấy sự kiện đang diễn ra (Active events)
 */
export const getActiveEvents = async (req, res) => {
    try {
        const now = new Date();
        const events = await eventModel
            .find({
                startDate: { $lte: now },
                endDate: { $gte: now },
                isActive: true,
            })
            .sort({ startDate: 1 });

        res.status(200).json({
            success: true,
            data: events,
            total: events.length,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Lỗi khi lấy sự kiện đang diễn ra",
            error: error.message,
        });
    }
};
