const crypto = require("crypto");

const { validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const sgMail = require("@sendgrid/mail");
require("dotenv").config();

const User = require("../models/user");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const sendEMail = async (pesan) => {
  try {
    await sgMail.send(pesan);
  } catch (error) {
    console.error(error);

    if (error.response) {
      console.error(error.response.body);
    }
  }
};

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
    userInput: {
      email: "",
      password: "",
    },
  });
};

exports.getSignup = async (req, res, next) => {
  let message = req.flash("error");
  const errors = validationResult(req);
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
    userInput: {
      email: "",
      password: "",
      confirmPassword: "",
    },
    validationErrors: errors.array(),
  });
};

exports.postSignup = async (req, res, next) => {
  try {
    const { email, password, confirmPassword } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).render("auth/signup", {
        path: "/signup",
        pageTitle: "Signup",
        isAuthenticated: false,
        errorMessage: errors.array()[0].msg,
        userInput: {
          email,
          password,
          confirmPassword,
        },
        validationErrors: errors.array(),
      });
    }

    const msg = {
      to: [email],
      from: {
        name: "tiootest",
        email: process.env.FROM_EMAIL,
      }, // Use the email address or domain you verified above
      subject: "Welcome to TokoKU! Your Account Is Ready",
      text: "Signup success!!",
      html: `
        <p>Dear User,</p>
        <p>Welcome to Your App Name! We're thrilled to have you on board.</p>
        <p>You have successfully signed up for our service. Here are a few things you can do:</p>
        <ul>
          <li>Explore our app features and functionalities.</li>
          <li>Complete your profile to personalize your experience.</li>
          <li>Contact our support team if you have any questions or need assistance.</li>
        </ul>
        <p>Thank you once again for joining us!</p>
        <p>Best Regards,<br/>Your App Name Team</p>
     `,
    };

    const userDoc = await User.findOne({ email: email });
    if (!userDoc) {
      const hashedPassword = await bcrypt.hash(password, 12);
      const newUser = new User({
        email,
        password: hashedPassword,
        cart: { items: [] },
      });
      await newUser.save();
      //* With this approach it maybe make our apps slow because we wait
      //* this function to complete before running the next script (In big app)
      const mail = await sendEMail(msg);
      if (!mail) {
        req.flash("Signup cannot succeded!");
      }
      req.flash("success", "User created succesfully");
      return res.redirect("/login");
    } else {
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
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).render("auth/login", {
        path: "/login",
        pageTitle: "Login",
        isAuthenticated: false,
        errorMessage: errors.array()[0].msg,
        userInput: {
          email,
          password,
        },
      });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(422).render("auth/login", {
        path: "/login",
        pageTitle: "Login",
        isAuthenticated: false,
        errorMessage: errors.array()[0].msg,
        userInput: {
          email,
          password,
        },
      });
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
      res.status(422).render("auth/login", {
        path: "/login",
        pageTitle: "Login",
        isAuthenticated: false,
        errorMessage: errors.array()[0].msg,
        userInput: {
          email,
          password,
        },
      });
    }
  } catch (err) {
    console.log(err);
  }
};

exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    if (err) {
      return console.log(err);
    }
    res.redirect("/");
  });
};

exports.getReset = (req, res, next) => {
  let errorMsg = req.flash("error");
  let successMsg = req.flash("success");

  if (errorMsg.length > 0) {
    errorMsg = errorMsg[0];
    successMsg = null;
  } else if (successMsg.length > 0) {
    successMsg = successMsg[0];
    errorMsg = null;
  } else {
    errorMsg = null;
    successMsg = null;
  }
  res.render("auth/reset", {
    path: "/reset",
    pageTitle: "Reset Password",
    errorMessage: errorMsg,
  });
};

exports.postReset = async (req, res, next) => {
  try {
    let userToken;
    const { email } = req.body;
    crypto.randomBytes(32, (err, buffer) => {
      if (err) {
        console.log(err);
        return res.flash("error", "Reseting password error");
      }

      const token = buffer.toString("hex");
      userToken = token;
    });
    const user = await User.findOne({ email: email });
    if (!user) {
      req.flash("error", "User with this usernmae does not exist");
      return res.redirect("/reset");
    }

    user.resetToken = userToken;
    user.resetTokenExpiration = Date.now() + 3600000;
    await user.save();

    const msg = {
      to: [email],
      from: {
        name: "tiootest",
        email: process.env.FROM_EMAIL,
      }, // Use the email address or domain you verified above
      subject: "Password Reset Request for Your TokoKU Account",
      text: "Reset success!!",
      html: `
        <h1>Password Reset Request</h1>
        <p>Hello,</p>
        <p>You have requested to reset your password. Click the following link to set a new password:</p>
        <p><a href="http://localhost:3000/reset/${userToken}">Reset Password</a></p>
        <p>If you did not request this password reset, please ignore this email. Your password will remain unchanged.</p>
        <p>Thank you!</p>
        <p>Best Regards,<br/>Your App Name Team</p>
      `,
    };

    const mail = await sendEMail(msg);
    if (!mail) {
      req.flash("success", "Reset password success");
      return res.redirect("/");
    }
  } catch (err) {
    console.log(err);
  }
};

exports.getNewPassword = async (req, res, next) => {
  try {
    let errorMsg = req.flash("error");
    let successMsg = req.flash("success");
    const token = req.params.token;
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiration: { $gt: Date.now() },
    });

    if (user) {
      if (errorMsg.length > 0) {
        errorMsg = errorMsg[0];
        successMsg = null;
      } else if (successMsg.length > 0) {
        successMsg = successMsg[0];
        errorMsg = null;
      } else {
        errorMsg = null;
        successMsg = null;
      }
      res.render("auth/new-password", {
        path: "/new-password",
        pageTitle: "New Password",
        errorMessage: errorMsg,
        successMessage: successMsg,
        passwordToken: token,
        userId: user._id,
      });
    } else {
      res.redirect("/login");
    }
  } catch (err) {
    console.log(err);
  }
};

exports.postNewPassword = async (req, res, next) => {
  try {
    const { password, userId, passwordToken } = req.body;
    const hashedPassword = await bcrypt.hash(password, 12);
    const updateUser = await User.findOneAndUpdate(
      { _id: userId, resetToken: passwordToken },
      {
        password: hashedPassword,
        $unset: { resetToken: "", resetTokenExpiration: "" },
      }
    );
    if (updateUser) {
      updateUser.resetToken = undefined;
      updateUser.resetTokenExpiration = undefined;
      await updateUser.save();
      req.flash("success", "Your password has been successfully updated.");
      res.redirect("/login");
    } else {
      req.flash(
        "error",
        "Oops! Something went wrong while updating your password."
      );
      res.redirect(`/reset/${passwordToken}`);
    }
  } catch (err) {
    req.flash(
      "error",
      "Oops! Something went wrong while updating your password."
    );
    res.redirect(`/reset/${passwordToken}`);
    console.log(err);
  }
};
