import ApiResponse from "../utils/apiResponse-utils.js";
import catchAsync from "../utils/catchAsync-utils.js";

export const healthCheck = catchAsync(async (req, res, next) => {
  res
    .status(200)
    .json(new ApiResponse(200, "server is up and running 🚀", {  }));
});
