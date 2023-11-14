const path = require('path');

const express = require('express');
const mongoose = require('mongoose')
const bodyParser = require('body-parser');

const errorController = require('./controllers/error');


const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// app.use(async (req, res, next) => {
//   try {
//     const user = await User.findById('6550911b417fbb89d7f05949');    
//     req.user = new User(user.name, user.email, user.cart, user._id);
//     next()
//   } catch (err) {
//     console.log(err)
//   }
// });

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

main().catch(err => console.log(err));
async function main() {
  await mongoose.connect('mongodb+srv://tiooluciferr666:8uQ8C4oZx4Uvg2wn@cluster0.4oajlgo.mongodb.net/shop?retryWrites=true');
  app.listen(3000, () => {
    console.log('Listening on port 3000');
  })
}

