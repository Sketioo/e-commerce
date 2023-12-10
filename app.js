const path = require("path");

const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const bodyParser = require("body-parser");
const csrf = require('csurf');
const flash = require('connect-flash');
require("dotenv").config();

const errorController = require("./controllers/error");
const User = require("./models/user");

const app = express();
const store = new MongoDBStore({
  //* Your cluster connection
  uri: process.env.MONGODB,
  collection: "sessions",
});
const csrfProtection = csrf();

app.set("view engine", "ejs");
app.set("views", "views");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.use(
  session({
    secret: "thisissecret",
    resave: false,
    saveUninitialized: false,
    store: store, //* we use it for saving session data in alternative storage
  })
);
app.use(csrfProtection)
app.use(flash())

app.use(async (req, res, next) => {
  try {
    if (!req.session.user) {
      return next();
    }
    const user = await User.findById(req.session.user._id);
    req.user = user;
    next();
  } catch (err) {
    console.log(err);
  }
});

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next()
})

app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use(errorController.get404);

main().catch((err) => console.log(err));
async function main() {
  try {
    await mongoose.connect(process.env.MONGODB);

    app.listen(3000, () => {
      console.log("Listening on port 3000");
    });
  } catch (err) {
    console.log(err);
  }
}
