const mongodb = require("mongodb");

const getDb = require("../util/database").getDb;
const ObjectId = mongodb.ObjectId;

class Product {
  constructor(title, imageUrl, price, description, id, userId) {
    this.title = title;
    this.price = price;
    this.description = description;
    this.imageUrl = imageUrl;
    this._id = id ? new ObjectId(id) : null;
    this.userId = userId;
  }

  async save() {
    try {
      const db = getDb();
      let dbOp;
      if (this._id) {
        dbOp = await db
          .collection("products")
          .updateOne({ _id:this._id }, { $set: this });
      } else {
        dbOp = await db.collection("products").insertOne(this);
      }
      return dbOp;
    } catch (err) {
      console.log(err);
    }
  }

  static async findById(id) {
    // console.log(id);
    try {
      const db = getDb();
      //* id pada mongodb kita bertipe data object
      let product = await db
        .collection("products")
        .findOne({ _id: new mongodb.ObjectId(id) })
      // console.log(product);
      return product;
    } catch (err) {
      console.log(err);
    }
  }

  static async fetchAll() {
    try {
      const db = getDb();
      const products = await db.collection("products").find().toArray();
      // console.log(products)
      return products;
    } catch (error) {
      console.log(error);
    }
  }

  static async deleteOne(id, product) {
    try {
      const db = getDb();
      await db
        .collection("products")
        .deleteOne({ _id: new mongodb.ObjectId(id) });
    } catch (err) {
      console.log(err);
    }
  }
}

module.exports = Product;
