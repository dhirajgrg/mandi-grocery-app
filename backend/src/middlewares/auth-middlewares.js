import User from "../models/user-models.js";
import AppError from "../utils/appError-utils.js";
import { jwtVerifyToken } from "../utils/jwtToken-utils.js";
import  catchAsync  from "../utils/catchAsync-utils.js";

//PROTECT MIDDLEWARE
export const protect = catchAsync(async (req, res, next) => {
  // GET TOKEN
  let token;
  if (req.headers.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies?.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return next(new AppError("You are not logged in. Please log in!", 401));
  }

  //VERIFY TOKEN
  const decoded = jwtVerifyToken(token);

  // CHECK USER EXISTS OR NOT ?
  const currentUser = await User.findById(decoded.id);

  if (!currentUser) {
    return next(new AppError("User no longer exists.", 401));
  }

  // CHECK PASSWORD HAVE BEEN CHANGE OR NOT AFTER JWT ISSUED
  if (currentUser.changePasswordAfter(decoded.iat)) {
    return next(
      new AppError("Your token has expired. Please log in again!", 401),
    );
  }

  // GRANT ACCESS
  req.user = currentUser;
  next();
});


//RBAC MIDDLEWARES
export const allowRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError("Permission denied", 403));
    }
    next();
  };
};
