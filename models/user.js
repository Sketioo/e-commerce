// const mongodb = require("mongodb");

// const getDb = require("../util/database").getDb;
// const ObjectId = mongodb.ObjectId;

// class User {
//   constructor(username, email, cart, id) {
//     this.username = username;
//     this.email = email;
//     this.cart = cart;
//     this._id = id;
//   }

//   async save() {
//     try {
//       const db = getDb();
//       const user = await db.collection("users").insertOne(this);
//       return user;
//     } catch (err) {
//       console.log(err);
//     }
//   }

//   async getCart() {
//     const db = getDb();
//     const productIds = this.cart.items.map((item) => {
//       return item.productId;
//     });
//     const fetchedCartItems = await db
//       .collection("products")
//       .find({ _id: { $in: productIds } })
//       .toArray();
//     const products = fetchedCartItems.map((p) => {
//       return {
//         ...p,
//         quantity: this.cart.items.find((i) => {
//           return i.productId.toString() === p._id.toString();
//         }).quantity,
//       };
//     });

//     return products;
//   }

//   async addToCart(product) {
//     try {
//       const cartProductIndex = this.cart.items.findIndex((cp) => {
//         return cp.productId.toString() === product._id.toString();
//       });
//       let newQuantity = 1;
//       const updatedCartItems = [...this.cart.items];

//       if (cartProductIndex >= 0) {
//         newQuantity = this.cart.items[cartProductIndex].quantity + 1;
//         updatedCartItems[cartProductIndex].quantity = newQuantity;
//       } else {
//         updatedCartItems.push({
//           productId: new ObjectId(product._id),
//           quantity: newQuantity,
//         });
//       }
//       const updatedCart = {
//         items: updatedCartItems,
//       };

//       const db = getDb();
//       return await db
//         .collection("users")
//         .updateOne(
//           { _id: new ObjectId(this._id) },
//           { $set: { cart: updatedCart } }
//         );
//     } catch (err) {
//       console.log(err);
//     }
//   }

//   async deleteCartItem(cartId) {
//     try {
//       const db = getDb();
//       const updatedCart = await this.cart.items.filter((p) => {
//         return p.productId.toString() !== cartId.toString();
//       });
//       console.log(updatedCart);
//       return await db
//         .collection("users")
//         .updateOne(
//           { _id: new ObjectId(this._id) },
//           { $set: { cart: { items: updatedCart } } }
//         );
//     } catch (err) {
//       console.log(err);
//     }
//   }

//   async getOrders() {
//     const db = getDb();
//     return await db
//       .collection("orders")
//       .find({ "user._id": new ObjectId(this._id) })
//       .toArray();
//   }

//   async addOrder() {
//     try {
//       const db = getDb();
//       const cartProducts = await this.getCart();
//       const order = {
//         items: cartProducts,
//         user: {
//           _id: new ObjectId(this._id),
//           name: this.username,
//         },
//       };
//       const dbOp = await db.collection("orders").insertOne(order);
//       if (dbOp) {
//         this.cart = [];
//       } else {
//         //* Better aproach is using error handling
//         console.log(`Can't add order!`);
//       }
//       return await db
//         .collection("users")
//         .updateOne(
//           { _id: new ObjectId(this._id) },
//           { $set: { cart: { items: [] } } }
//         );
//     } catch (err) {
//       console.log(err);
//     }
//   }

//   static async findById(id) {
//     try {
//       const db = getDb();
//       let user = await db
//         .collection("users")
//         .findOne({ _id: new mongodb.ObjectId(id) });
//       return user;
//     } catch (err) {
//       console.log(err);
//     }
//   }
// }

// module.exports = User;
