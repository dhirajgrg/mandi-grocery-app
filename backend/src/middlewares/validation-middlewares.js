import { validationResult } from "express-validator";

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    //for development mode see log
    console.log("Validation Failed:", errors.array());
    //response json
    return res.status(400).json({
      status: "fail",
      errors: errors.array(),
    });
  }
  next();
};

export default validate;
