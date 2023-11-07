const mongodb = require('mongodb')

const Product = require("../models/product");
const ObjectId = mongodb.ObjectId;

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
    const product = new Product(title, imageUrl, price, description);
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
    const product = await Product.findById(prodId)
    // console.log(product)
  
    res.render("admin/edit-product", {
      pageTitle: "Edit Product",
      path: "/admin/edit-product",
      editing: editMode,
      product: product,
    });
  } catch (err) {
    console.log(err)
  }
};

exports.postEditProduct = async (req, res, next) => {
  const { productId, title, imageUrl, price, description } = req.body;
  try {
    const product = new Product(title, imageUrl, price, description, new ObjectId(productId))
    const updateProd = await product.save()
    console.log(updateProd)
    res.redirect(`/admin/products`)
  } catch (err) {
    console.log(err)
  }
  // Product.findById(prodId)
  //   .then(product => {
  //     product.title = updatedTitle;
  //     product.price = updatedPrice;
  //     product.description = updatedDesc;
  //     product.imageUrl = updatedImageUrl;
  //     return product.save();
  //   })
  //   .then(result => {
  //     console.log('UPDATED PRODUCT!');
  //     res.redirect('/admin/products');
  //   })
  //   .catch(err => console.log(err));
};

exports.getProducts = async (req, res, next) => {
  try {
    const products = await Product.fetchAll();
    // console.log(products)
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
  const deleteProd = await Product.deleteOne(prodId);
  res.redirect('/admin/products')
  // Product.findById(prodId)
  //   .then(product => {
  //     return product.destroy();
  //   })
  //   .then(result => {
  //     console.log('DESTROYED PRODUCT');
  //     res.redirect('/admin/products');
  //   })
  //   .catch(err => console.log(err));
};
