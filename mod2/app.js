const http = require('http');
const express = require('express');
const path = require('path');
const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');

const app = express();
// const sequelize = require('./util/database');
const bodyParser = require('body-parser');
const errorController = require('./controllers/error');
// const mongoConnect = require('./util/database').mongoConnect;
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStrore = require('connect-mongodb-session')(session);

const Product = require('./models/product');
const User = require('./models/user'); 
const MONGODB_URI = "mongodb+srv://user1:NlqAN1JAwZzfLFkP@cluster0.ekyqa.mongodb.net/shop";
const store = new MongoDBStrore({
    uri: MONGODB_URI,
    collection: 'sessions'
});
// const Cart = require('./models/cart');
// const CartItem = require('./models/cart-item'); 
// const Order = require('./models/order'); 
// const OrderItem = require('./models/order-item'); 

app.set('view engine','ejs');
// app.set('view engine','pug');
app.set('views','views');
app.use(bodyParser.urlencoded({extended:false}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    secret: 'some string', 
    resave: false, 
    saveUninitialized: false,
    store: store
}));
app.use((req, res, next) => {
    if(!req.session.user){
        return next();
    }
    User.findById(req.session.user._id)
        .then(user => {
            req.user = user;
            next();
        })
        .catch(err => console.log(err))
});
app.use((req, res, next) => {                           //adds user for every incoming request
    User.findById('5f06e6399982582ba2dc568e')
        .then(user => {
            // console.log("------>"+user.id+"<-------");
            req.user = user;
            next();
        })
        .catch(err => console.log(err))
});
app.use('/admin',adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);
app.use(errorController.get404);

mongoose.connect(MONGODB_URI)
    .then(result => {
        User.findOne().then(user => {
            if(!user){
                const user = new User({
                    name: 'Rakesh',
                    email: 'rakesh@gmail.com',
                    cart: { items: []}
                });
                user.save();       
            }
        })
        app.listen(3000);
    }).catch(err => console.log(err));



// mongoConnect(() => {
//     app.listen(3000);
// })

// Product.belongsTo(User, {constraints: true, onDelete: 'CASCADE'});
// User.hasMany(Product)
// User.hasOne(Cart);
// Cart.belongsTo(User);
// Cart.belongsToMany(Product, { through: CartItem});    //Many to many
// Product.belongsToMany(Cart, { through: CartItem});
// Order.belongsTo(User);                                      //1 to many
// User.hasMany(Order);
// Order.belongsToMany(Product, {through: OrderItem});
// sequelize
//     // .sync({force: true})
//     .sync()
//     .then(result => {
//         return User.findByPk(1);
//     })
//     .then((user) => {
//         if (!user){
//             return User.create({name:'Rakesh', email:'Rakesh@gmail.com'});
//         }
//         return user;
//     })
//     .then(user => {
//         // console.log(user);
//         return user.createCart()
//     })
//     .then(cart => {
//         app.listen(3000);
 
//     })
//     .catch(err => {
//         console.log(err);
//     })








