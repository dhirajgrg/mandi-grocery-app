import path from "path";
import ImageKit from "imagekit";
import AppError from "./appError-utils.js";

const requiredImageKitEnv = [
  "IMAGEKIT_PUBLIC_KEY",
  "IMAGEKIT_PRIVATE_KEY",
  "IMAGEKIT_URL_ENDPOINT",
];

const isImageKitConfigured = requiredImageKitEnv.every((envName) =>
  Boolean(process.env[envName]),
);

const imagekit = isImageKitConfigured
  ? new ImageKit({
      publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
      privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
      urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
    })
  : null;

const sanitizeFilenamePart = (value) => {
  return (
    value
      ?.toLowerCase()
      .replace(/[^a-z0-9.-]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "") || "product-image"
  );
};

export const uploadProductImageToImageKit = async (file) => {
  if (!file) {
    throw new AppError("Please upload a product image file", 400);
  }

  if (!imagekit) {
    throw new AppError(
      "ImageKit is not configured on the server. Add IMAGEKIT keys in .env",
      500,
    );
  }

  const fileExtension = path.extname(file.originalname || "") || ".jpg";
  const baseName = path.basename(
    file.originalname || "product-image",
    fileExtension,
  );
  const fileName = `${sanitizeFilenamePart(baseName)}-${Date.now()}${fileExtension.toLowerCase()}`;

  try {
    const uploadResult = await imagekit.upload({
      file: file.buffer,
      fileName,
      folder: "/mandi/products",
      useUniqueFileName: true,
    });

    if (!uploadResult?.url) {
      throw new AppError(
        "Image upload failed. No URL returned by ImageKit",
        500,
      );
    }

    return uploadResult.url;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError(error.message || "ImageKit upload failed", 500);
  }
};

export const uploadProfilePicToImageKit = async (file) => {
  if (!file) {
    throw new AppError("Please upload a profile image file", 400);
  }

  if (!imagekit) {
    throw new AppError(
      "ImageKit is not configured on the server. Add IMAGEKIT keys in .env",
      500,
    );
  }

  const fileExtension = path.extname(file.originalname || "") || ".jpg";
  const baseName = path.basename(
    file.originalname || "profile-pic",
    fileExtension,
  );
  const fileName = `${sanitizeFilenamePart(baseName)}-${Date.now()}${fileExtension.toLowerCase()}`;

  try {
    const uploadResult = await imagekit.upload({
      file: file.buffer,
      fileName,
      folder: "/mandi/profiles",
      useUniqueFileName: true,
    });

    if (!uploadResult?.url) {
      throw new AppError(
        "Image upload failed. No URL returned by ImageKit",
        500,
      );
    }

    return uploadResult.url;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError(error.message || "ImageKit upload failed", 500);
  }
};
