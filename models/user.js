const mongoose = require("mongoose");

const Product = require("./product");
const { Schema } = mongoose;

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  resetToken: String,
  resetTokenExpiration: String,
  cart: {
    items: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: { type: Number, required: true },
      },
    ],
  },
});

userSchema.methods.clearCart = async function() {
  try {
    this.cart = {items: []}
    await this.save()
  } catch (err) {
    console.log(err)
  }
}

userSchema.methods.deleteFromCart = async function (productId) {
  try {
    const updatedCart = await this.cart.items.filter((p) => {
      return p._id.toString() !== productId.toString();
    });
  
    this.cart.items = updatedCart;
    await this.save();
  } catch (err) {
    console.log(err)
  }
};
userSchema.methods.addToCart = async function (product) {
  try {
    const cartProductIndex = this.cart.items.findIndex((cp) => {
      return cp.productId.toString() === product._id.toString();
    });
    let newQuantity = 1;
    const updatedCartItems = [...this.cart.items];

    if (cartProductIndex >= 0) {
      newQuantity = this.cart.items[cartProductIndex].quantity + 1;
      updatedCartItems[cartProductIndex].quantity = newQuantity;
    } else {
      updatedCartItems.push({
        productId: product._id,
        quantity: newQuantity,
      });
    }
    const updatedCart = {
      items: updatedCartItems,
    };

    this.cart = updatedCart;
    await this.save();
  } catch (err) {
    console.log(err);
  }
};

module.exports = mongoose.model("User", userSchema);