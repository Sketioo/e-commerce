const path = require('path');

const express = require('express');
const mongoose = require('mongoose')
const bodyParser = require('body-parser');
const User = require('./models/user')

const errorController = require('./controllers/error');


const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(async (req, res, next) => {
  try {
    const user = await User.findById('65532f71b9a37ab38f25347c');    
    req.user = user;
    next()
  } catch (err) {
    console.log(err)
  }
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

main().catch(err => console.log(err));
async function main() {
  await mongoose.connect('mongodb+srv://tiooluciferr666:8uQ8C4oZx4Uvg2wn@cluster0.4oajlgo.mongodb.net/shop?retryWrites=true');
  const findUser = User.findOne()
  if(!findUser) {
    const user = new User({name: 'tioo', email: 'tiooluciff@gmail.com'})
    await user.save()
  }
  app.listen(3000, () => {
    console.log('Listening on port 3000');
  })
}

