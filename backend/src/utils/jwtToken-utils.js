import jwt from "jsonwebtoken";

export const jwtSignToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

export const jwtVerifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET_KEY);
};
