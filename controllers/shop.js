const Product = require("../models/product");
const Order = require("../models/order");

exports.getProducts = (req, res, next) => {
  Product.find()
    .then((products) => {
      res.render("shop/product-list", {
        prods: products,
        pageTitle: "All Products",
        path: "/products",
        
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then((product) => {
      res.render("shop/product-detail", {
        product: product,
        pageTitle: product.title,
        path: "/products",
        
      });
    })
    .catch((err) => console.log(err));
};

exports.getIndex = (req, res, next) => {
  Product.find()
    .then((products) => {
      res.render("shop/index", {
        prods: products,
        pageTitle: "Shop",
        path: "/",
        
        csrfToken: req.csrfToken(),
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getCart = async (req, res, next) => {
  try {
    const user = await req.user.populate("cart.items.productId");
    const products = user.cart.items;
    let successMsg = req.flash('success');
    if (successMsg.length > 0) {
      successMsg = successMsg[0];
    } else {
      successMsg = null;
    }
    res.render("shop/cart", {
      path: "/cart",
      pageTitle: "Your Cart",
      products: products,
      successMsg
    });
  } catch (err) {
    console.log(err);
  }
};

exports.postCart = async (req, res, next) => {
  try {
    const prodId = req.body.productId;
    const product = await Product.findById(prodId);
    const addProduct = await req.user.addToCart(product);
    req.flash('success', 'Added to cart!')
    res.redirect("/cart");
  } catch (err) {
    res.flash('error', 'An error occurred. Please try again')
    console.log(err);
  }
};

exports.postCartDeleteProduct = async (req, res, next) => {
  const prodId = req.body.productId;
  console.log(prodId);
  req.user.deleteFromCart(prodId);
  res.redirect("/cart");
};

exports.postOrder = async (req, res, next) => {
  try {
    // const order = await req.user.addOrder();
    const user = await req.user.populate("cart.items.productId");
    const orderProducts = user.cart.items.map((i) => {
      return { quantity: i.quantity, product: { ...i.productId._doc } };
    });

    const order = new Order({
      products: orderProducts,
      user: {
        userId: req.user,
        name: req.user.email,
        
      },
    });

    const newOrder = await order.save();
    if (newOrder) {
      req.user.clearCart();
      req.flash('success', 'Successfully make an order!')
      res.redirect("/orders");
    } else {
      console.log(`Can't add order!`);
    }
  } catch (err) {
    console.log(err);
  }
};

exports.getOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ "user.userId": req.user._id });
    let successMsg = req.flash('success');
    if (successMsg.length > 0) {
      successMsg = successMsg[0];
    } else {
      successMsg = null;
    }
    if (orders) {
      res.render("shop/orders", {
        path: "/orders",
        pageTitle: "Your Orders",
        orders: orders,
        successMsg
      });
    }
  } catch (err) {
    console.log(err);
  }
};
