const Product = require("../models/product");

exports.getAddProduct = (req, res, next) => {
  res.render("admin/edit-product", {
    pageTitle: "Add Product",
    path: "/admin/add-product",
    editing: false,
  });
};

exports.postAddProduct = async (req, res, next) => {
  const { title, imageUrl, price, description } = req.body;
  try {
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

    res.render("admin/edit-product", {
      pageTitle: "Edit Product",
      path: "/admin/edit-product",
      editing: editMode,
      product: product,
    });
  } catch (err) {
    console.log(err);
  }
};

exports.postEditProduct = async (req, res, next) => {
  try {
    const { productId, title, imageUrl, price, description } = req.body;

    const product = await Product.findById(productId);
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
    const products = await Product.find({userId: req.user.id})
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
