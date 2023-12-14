const Product = require("../models/product");

const { validationResult } = require("express-validator");

exports.getAddProduct = (req, res, next) => {
  // const errors = validationResult(req);
  res.render("admin/edit-product", {
    pageTitle: "Add Product",
    path: "/admin/add-product",
    editing: false,
    errorMessage: null,
    userInput: {
      title: '',
      imageUrl: '',
      price: '',
      description: '',
    },
  });
};

exports.postAddProduct = async (req, res, next) => {
  try {
    const { title, imageUrl, price, description } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).render("admin/edit-product", {
        path: "/add-product",
        pageTitle: "Add product",
        editing: false,
        errorMessage: errors.array()[0].msg,
        userInput: {
          title,
          imageUrl,
          price,
          description,
        },
      });
    }
    const product = new Product({
      title,
      price,
      imageUrl,
      description,
      userId: req.user,
    });
    const result = await product.save();
    res.redirect("/products");
  } catch (err) {
    console.log(err);
  }
};

exports.getEditProduct = async (req, res, next) => {
  try {
    const editMode = req.query.edit;
    if (!editMode) {
      return res.redirect("/");
    }
    const prodId = req.params.productId;
    const product = await Product.findById(prodId);
    if (req.user._id.toString() !== product.userId.toString()) {
      return res.redirect("/admin/products");
    }
    const {title, imageUrl, price, description} = product

    res.render("admin/edit-product", {
      pageTitle: "Edit Product",
      path: "/admin/edit-product",
      editing: editMode,
      product: product,
      errorMessage: null,
      userInput: {
        title,
        imageUrl,
        price,
        description,
      },

    });
  } catch (err) {
    console.log(err);
  }
};

exports.postEditProduct = async (req, res, next) => {
  try {
    const { productId, title, imageUrl, price, description } = req.body;
    const product = await Product.findById(productId);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).render("admin/edit-product", {
        path: "/add-product",
        pageTitle: "Add product",
        editing: true,
        errorMessage: errors.array()[0].msg,
        product: product,
        userInput: {
          title,
          imageUrl,
          price,
          description,
        },
      });
    }
    if (req.user._id.toString() !== product.userId.toString()) {
      return res.redirect("/admin/products");
    }
    const productOp = await Product.findOneAndUpdate(
      { _id: productId },
      { title, imageUrl, price, description }
    );

    if (productOp) {
      await product.save();
      res.redirect(`/admin/products`);
    } else {
      req.flash("error", "Can't edit product! something went wrong");
      res.redirect("/admin/products");
    }
  } catch (err) {
    console.log(err);
  }
};

exports.getProducts = async (req, res, next) => {
  try {
    const products = await Product.find({ userId: req.user.id });
    // .select("title description")
    // .populate("userId", "name");
    res.render("admin/products", {
      prods: products,
      pageTitle: "Admin Products",
      path: "/admin/products",
    });
  } catch (err) {
    console.log(err);
  }
};

exports.postDeleteProduct = async (req, res, next) => {
  const prodId = req.body.productId;
  const deleteProduct = await Product.deleteOne({
    _id: prodId,
    userId: req.user._id,
  });
  if (deleteProduct.deletedCount == 0) {
    return res.redirect("/login");
  }
  res.redirect("/admin/products");
};
