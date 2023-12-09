const bcrypt = require("bcrypt");

const User = require("../models/user");

exports.getLogin = (req, res, next) => {
  let message = req.flash("error");
  let successMsg = req.flash("success");
  if (successMsg.length > 0) {
    successMsg = successMsg[0];
    message = null;
  } else if (message.length > 0) {
    message = message[0];
    successMsg = null;
  } else {
    successMsg = null;
    message = null;
  }
  res.render("auth/login", {
    path: "/login",
    pageTitle: "Login",
    isAuthenticated: false,
    errorMessage: message,
    successMessage: successMsg,
  });
};

exports.getSignup = async (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("auth/signup", {
    path: "/signup",
    pageTitle: "Signup",
    isAuthenticated: false,
    errorMessage: message,
  });
};

exports.postSignup = async (req, res, next) => {
  try {
    const { email, password, confirmPassword } = req.body;

    const userDoc = await User.findOne({ email: email });
    if (!userDoc) {
      const hashedPassword = await bcrypt.hash(password, 12);
      const newUser = new User({
        email,
        password: hashedPassword,
        cart: { items: [] },
      });
      await newUser.save();
      req.flash("success", "User created succesfully");
      res.redirect("/login");
    } else {
      req.flash("error", "A user with this email already exists. Please use a different email");
      return res.redirect("/signup");
    }
  } catch (err) {
    console.log(err);
    // Handle the error appropriately (e.g., display a generic error message)
    req.flash("error", "An error occurred. Please try again.");
    console.log(err);
  }
};

exports.postLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      req.flash("error", "Invalid email or password.");
      return res.redirect("/login");
    }

    const doMatch = await bcrypt.compare(password, user.password);
    if (doMatch) {
      req.session.isLoggedIn = true;
      req.session.user = user;
      await req.session.save(() => {
        return res.redirect("/");
      });
    } else {
      req.flash("error", "Invalid email or password.");
      res.redirect("/login");
    }
  } catch (err) {
    console.log(err);
  }
};

exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    console.log(err);
    res.redirect("/");
  });
};
