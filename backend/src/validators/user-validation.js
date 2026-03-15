import { body } from "express-validator";
import validate from "../middlewares/validation-middlewares.js";

const userValidation = [
  body("name").notEmpty().isString().trim().withMessage("Name required"),
  body("email").notEmpty().isEmail().trim().withMessage("Email is required"),
  body("password")
    .notEmpty()
    .isString()
    .isLength({ min: 4 })
    .withMessage("Password is required"),
  body("passwordConfirm")
    .notEmpty()
    .isString()
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Passwords do not match");
      }
      return true;
    }),
  body("mobile")
    .notEmpty()
    .withMessage("Mobile number is required")
    .matches(/^\d{10}$/)
    .withMessage("Mobile number must be exactly 10 digits"),
  validate,
];

export default userValidation;
