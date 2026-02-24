/**
 * Standardized response helper functions
 * Ensures consistent API response format across all endpoints
 */

export const successResponse = (res, data, message = "Success", statusCode = 200) => {
    return res.status(statusCode).json({
        success: true,
        message,
        data,
    });
};

export const errorResponse = (res, message = "Error occurred", statusCode = 500, error = null) => {
    const response = {
        success: false,
        message,
    };

    if (error && process.env.NODE_ENV === "development") {
        response.error = error.message || error;
    }

    return res.status(statusCode).json(response);
};

export const paginatedResponse = (res, data, pagination, message = "Success") => {
    return res.status(200).json({
        success: true,
        message,
        data,
        pagination: {
            total: pagination.total,
            page: pagination.page,
            limit: pagination.limit,
            totalPages: Math.ceil(pagination.total / pagination.limit),
        },
    });
};
