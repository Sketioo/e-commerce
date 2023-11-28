const User = require('../models/user')

exports.getLogin = (req, res, next) => {

  res.render("auth/login", {
    path: "/login",
    pageTitle: "Login",
    isAuthenticated: req.session.isLoggedIn,
  });
};

exports.getSignup = async(req, res, next) => {
  res.render('auth/signup', {
    path: "/signup",
    pageTitle: "Signup",
    isAuthenticated: req.session.isLoggedIn,
  })
}

exports.postLogin = async (req, res, next) => {
  const user = await User.findById('65532f71b9a37ab38f25347c')
  req.session.isLoggedIn = true;
  req.session.user = user;
  req.session.save(() => {
    res.redirect("/");
  })
};

exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    console.log(err)
    res.redirect("/");
  })
};
