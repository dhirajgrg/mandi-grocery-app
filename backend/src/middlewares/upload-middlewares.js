import multer from "multer";
import AppError from "../utils/appError-utils.js";

const storage = multer.memoryStorage();

const fileFilter = (_, file, callback) => {
  if (!file.mimetype?.startsWith("image/")) {
    callback(new AppError("Only image files are allowed", 400));
    return;
  }

  callback(null, true);
};

export const productImageUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

export const profilePicUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024,
  },
});
