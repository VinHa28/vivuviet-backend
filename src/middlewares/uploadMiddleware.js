import multer from "multer";
import cloudinary from "../config/cloudinaryConfig.js";
import streamifier from "streamifier";

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Chỉ cho phép tải lên hình ảnh!"), false);
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 3 * 1024 * 1024 }, // 3MB
  fileFilter: fileFilter,
});

const uploadToCloudinary = (fileBuffer, folderName = "vivuviet_uploads") => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: folderName,
        resource_type: "auto",
      },
      (error, result) => {
        if (result) resolve(result);
        else reject(error);
      },
    );
    streamifier.createReadStream(fileBuffer).pipe(stream);
  });
};

export { upload, uploadToCloudinary };
