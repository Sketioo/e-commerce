const { check } = require("express-validator");

const User = require("../models/user");

//* We dont need to call next bcz express-validator already handle such a thing
exports.signUpValidate = [
  check("email")
    .isEmail()
    .withMessage("Invalid email address")
    .normalizeEmail()
    .custom(async (value, { req }) => {
      const user = await User.findOne({ email: value });
      console.log(user);
      if (user) {
        throw new Error(
          "A user with this email already exists. Please use a different email"
        );
      }
      return true;
    }),
  check("password", "Password must be at least 6 characters long")
    .isLength({ min: 6 })
    .isAlphanumeric()
    .trim(),
  check("confirmPassword")
    .trim()
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Passwords must match");
      }
      return true;
    }),
];

exports.loginValidate = [
  check("email")
    .isEmail()
    .withMessage("Invalid email address")
    .normalizeEmail()
    .custom(async (value, { req }) => {
      const user = await User.findOne({ email: value });
      if (!user) {
        throw new Error("Invalid email or password");
      }
      return true;
    }),
  check("password", "Invalid email or password")
    .isLength({
      min: 6,
    })
    .isAlphanumeric()
    .trim(),
];

exports.validateAddProduct = [
  check("title")
    .isLength({ min: 3 })
    .withMessage("Title must be at least 3 characters long")
    .trim(),
  check("imageUrl").isString().notEmpty().withMessage("Image URL cannot be empty"),
  check("price").isFloat({ gt: 0 }).withMessage("Price must be greater than 0"),
  check("description")
    .isLength({ min: 5, max: 400 })
    .withMessage("Description must be at least 5 characters long"),
];

exports.validateEditProduct = [
  check("title")
    .isLength({ min: 3 })
    .withMessage("Title must be at least 3 characters long")
    .trim(),
    check("imageUrl").isString().notEmpty().withMessage("Image URL cannot be empty"),
  check("price").isFloat({ gt: 0 }).withMessage("Price must be greater than 0"),
  check("description")
    .isLength({ min: 5, max: 400 })
    .withMessage("Description must be at least 5 characters long"),
];
