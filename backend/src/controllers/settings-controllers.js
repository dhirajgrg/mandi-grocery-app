import Settings from "../models/Settings.js";
import catchAsync from "../utils/catchAsync-utils.js";
import ApiResponse from "../utils/apiResponse-utils.js";

// GET /api/v1/settings/shop-status — public
export const getShopStatus = catchAsync(async (req, res) => {
  const setting = await Settings.findOne({ key: "shopOpen" });
  const isOpen = setting ? setting.value : true; // default open
  res.status(200).json(new ApiResponse(200, "Shop status fetched", { isOpen }));
});

// PATCH /api/v1/settings/shop-status — admin only
export const toggleShopStatus = catchAsync(async (req, res) => {
  let setting = await Settings.findOne({ key: "shopOpen" });
  if (!setting) {
    setting = await Settings.create({ key: "shopOpen", value: false });
  } else {
    setting.value = !setting.value;
    await setting.save();
  }
  const isOpen = setting.value;

  // Notify all connected clients via socket
  try {
    const { getIO } = await import("../socket.js");
    getIO().emit("shop_status_changed", { isOpen });
  } catch {
    // socket not critical
  }

  res.status(200).json(
    new ApiResponse(200, `Shop is now ${isOpen ? "open" : "closed"}`, {
      isOpen,
    }),
  );
});
