// const Sequelize = require("sequelize");
// const sequelize = require('../util/database');

const { getDb } = require('../util/database');

// const User = sequelize.define('User',
//     {
//         id: {
//             type: Sequelize.INTEGER,
//             autoIncrement: true,
//             allowNull: false,
//             primaryKey: true
//         },
//         name: Sequelize.STRING,
//         email: Sequelize.STRING
//     });
//     module.exports = User;
// const db = require('../util/database').getDb;
// const mongodb = require('mongodb');
// const e = require('express');


// class User{
//     constructor(username, email, cart, id){
//         this.name = username;
//         this.email = email;
//         this.cart = cart;      //{items: []}
//         this._id = id;
//     }
//     save(){
//         const db = getDb();
//         return db.collection('users').insertOne(this);
//     }
//     addToCart(product){
//             const cartProductIndex = this.cart.items.findIndex(cp => {
//                 console.log(cp.productId, product._id);
//                 return cp.productId.toString() === product._id.toString();
//             });
//         let newQuantity = 1;
//         const updatedCartItems = [...this.cart.items];
//         if(cartProductIndex >= 0){
//             newQuantity =  this.cart.items[cartProductIndex].quantity + 1;                                   // This product already exists 
//             updatedCartItems[cartProductIndex].quantity = newQuantity;
//         }
//         else{   // equivalent to product.quanity = 1
//             updatedCartItems.push({productId: new mongodb.ObjectId(product._id), quantity: newQuantity})
//         }
//         const updatedCart = {items: updatedCartItems};
//         const db = getDb();
//         return db.collection('users').updateOne({_id: new mongodb.ObjectId(this._id)},
//         { $set: {cart: updatedCart}});
//     }
//     getCart(){
//         const db = getDb();
//         const productIds = this.cart.items.map(i => {        // array of items in cart => array of prodId
//             return i.productId;
//         })
//         return db.collection('products').find({_id : {$in: productIds}}).toArray()
//             .then(products => {     // receive array of products in cart along with quantity
//                 return products.map(p => {
//                     return {...p, quantity: this.cart.items.find(i => {
//                         return i.productId.toString() === p._id.toString()
//                     }).quantity}
//                 })
//             });
//     }
//     deleteItemFromCart(productId){
//         const updatedCartItems = [...this.cart.items.filter(item => {
//             return item.productId.toString() !== productId.toString()
//         })];
//         const db = getDb();
//         return db.collection('users').updateOne({_id: new mongodb.ObjectId(this._id)},
//         { $set: {cart: {items: updatedCartItems}}});

//     }
//     addOrder(){
//         const db = getDb();
//         return this.getCart().then(products => {
//             const order = {
//                 items: products,
//                 user: {
//                     _id: new mongodb.ObjectId(this._id),
    
//                 }
//             } 
//             return db.collection('orders').insertOne(order)   
//         })
//         .then(result => {

//             this.cart = {items: []};
//             return db
//             .collection('users')
//             .updateOne(
//                 {_id: new mongodb.ObjectId(this._id)},
//                 { $set: {cart: {items: []}}}
//             )
//         })
//         .catch(err => console.log(err));
//     }
//     getOrders(){
//         const db = getDb();
//         return db.collection('orders').find({'user._id': new mongodb.ObjectId(this._id)}).toArray();
//     }

//     static findById(userId){
//         const db = getDb();
//         return db.collection('users').find({_id: new mongodb.ObjectId(userId)}).next();  //to get 1st element in cursor
//     }
// }
// module.exports = User;

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    resetToken: String,
    resetTokenExpiration: Date,
    email:{
        type: String,
        required: true
    },
    cart: {
        items: [{productId: {type: Schema.Types.ObjectId, ref: 'Product', required: true},
             quantity: {type: Number, required: true}}]
    }
});
userSchema.methods.addToCart = function(product) {
    const cartProductIndex = this.cart.items.findIndex(cp => {
            console.log(cp.productId, product._id);
            return cp.productId.toString() === product._id.toString();
        });
    let newQuantity = 1;
    const updatedCartItems = [...this.cart.items];
    if(cartProductIndex >= 0){
        newQuantity =  this.cart.items[cartProductIndex].quantity + 1;                                   // This product already exists 
        updatedCartItems[cartProductIndex].quantity = newQuantity;
    }
    else{   // equivalent to product.quanity = 1
        updatedCartItems.push({productId: product._id, quantity: newQuantity})
    }
    const updatedCart = {items: updatedCartItems};
    this.cart = updatedCart;
    return this.save();
}
userSchema.methods.deleteItemFromCart = function(productId) {
    const updatedCartItems = [...this.cart.items.filter(item => {
        return item.productId.toString() !== productId.toString()
    })];
    this.cart.items = updatedCartItems;
    return this.save();
}
userSchema.methods.clearCart = function(){
    this.cart = {
        items:[]
    }
    return this.save();
}
module.exports = mongoose.model('User',userSchema);