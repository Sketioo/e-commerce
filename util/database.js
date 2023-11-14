//! We dont use this anymore!

const mongodb = require("mongodb");
const MongoClient = mongodb.MongoClient;

let _db;
let mongoConnectionString =
  "mongodb+srv://tiooluciferr666:8uQ8C4oZx4Uvg2wn@cluster0.4oajlgo.mongodb.net/shop?retryWrites=true";

const mongoConnect = (callback) => {
  MongoClient.connect(mongoConnectionString, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
    .then((client) => {
      console.log("Connected!");
      _db = client.db();
      callback();
    })
    .catch((err) => {
      console.log(err);
      throw err;
    });
};

const getDb = () => {
  if (_db) {
    return _db;
  }
  throw "No database found!";
};

exports.mongoConnect = mongoConnect;
exports.getDb = getDb;
