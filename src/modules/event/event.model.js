import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Tiêu đề sự kiện là bắt buộc"],
            trim: true,
        },
        description: {
            type: String,
            required: [true, "Mô tả sự kiện là bắt buộc"],
        },
        image: {
            type: String,
            required: [true, "Hình ảnh sự kiện là bắt buộc"],
        },
        startDate: {
            type: Date,
            required: [true, "Ngày bắt đầu sự kiện là bắt buộc"],
        },
        endDate: {
            type: Date,
            required: [true, "Ngày kết thúc sự kiện là bắt buộc"],
            validate: {
                validator(value) {
                    return value >= this.startDate;
                },
                message: "Ngày kết thúc phải sau ngày bắt đầu",
            },
        },
        location: {
            type: String,
            required: [true, "Địa điểm sự kiện là bắt buộc"],
            trim: true,
        },
        status: {
            type: String,
            enum: ["active", "inactive", "upcoming", "ended"],
            default: "active",
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

// Middleware: Cập nhật trạng thái dựa trên ngày
eventSchema.pre("save", function (next) {
    const now = new Date();
    if (now < this.startDate) {
        this.status = "upcoming";
    } else if (now > this.endDate) {
        this.status = "ended";
    } else {
        this.status = "active";
    }
    next();
});

// Index để tìm kiếm nhanh
eventSchema.index({ startDate: 1, endDate: 1 });
eventSchema.index({ status: 1 });
eventSchema.index({ isActive: 1 });

const eventModel = mongoose.model("Event", eventSchema);

export default eventModel;
