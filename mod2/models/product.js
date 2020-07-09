// // const fs = require('fs');
// // const path = require('path');
// const Cart = require('./cart');
// const db = require('../util/database');



// // const p = path.join(path.dirname(process.mainModule.filename),
// // 'data',
// // 'products.json'
// // );

// // const getProductsFromFile = (cb) => {
// //     fs.readFile(p, (err, fileContent) => {
// //         if(!err){
// //             cb(JSON.parse(fileContent));
// //         }
// //         else{
// //             cb([]);
// //         }
// //     })

// // }
// // const products = [];
// module.exports = class Product{
//     constructor(id, title, imageUrl, description, price){
//         this.id = id;
//         this.title = title;
//         this.imageUrl = imageUrl;
//         this.description = description;
//         this.price = price;
//     }
//     save(){

//         // getProductsFromFile((products) => {
//         //     if(this.id){
//         //         const existingProductIndex = products.findIndex(prod => prod.id === this.id);
//         //         const updatedProducts = [...products];
//         //         updatedProducts[existingProductIndex] = this;
//         //         fs.writeFile(p, JSON.stringify(updatedProducts), (err) => {
//         //             console.log(err);
//         //         });
//         //     }
//         //     else{
//         //         this.id = Math.random().toString();
//         //         products.push(this);
//         //         fs.writeFile(p, JSON.stringify(products), (err) => {
//         //             console.log(err);
//         //         });
//         //     }

//         // });

//         return db.execute('insert into products (title, price, imageUrl, description) values (?, ?, ?, ?)',
//             [this.title, this.price, this.imageUrl, this.description]
//         );    
//     }
//     // static fetchAll(cb){
//     //     getProductsFromFile(cb);
//     // }

//     // static findById(id, cb){
//     //     getProductsFromFile( products => {
//     //         const product = products.find(p => p.id === id);
//     //         cb(product);
//     //     })
//     // }
//     // static deleteById(id, cb){

//     //     getProductsFromFile(products => {
//     //         const product = products.find(prod => prod.id === id);
//     //         const updatedProducts = products.filter(prod => prod.id !== id); //returns filtered array
//     //         fs.writeFile(p, JSON.stringify(updatedProducts), err => {
//     //             if(!err){
//     //                 Cart.deleteProduct(id, product.price);
//     //             }
//     //         });
//     //     });
//     // }


//     static fetchAll(){
//         return db.execute('select * from products');
//     }
//     static findById(id){
//         return db.execute('select * from products where products.id = ?', [id]);
//     }
//     static deleteById(id){

//     }
// }

// const Sequelize = require('sequelize');
// const sequelize = require('../util/database');
// const Product = sequelize.define('product', {
//     id: {
//         type: Sequelize.INTEGER,
//         autoIncrement: true,
//         allowNull: false,
//         primaryKey: true
//     },
//     title: Sequelize.STRING,
//     price: {
//         type: Sequelize.DOUBLE,
//         allowNull: false
//     },
//     imageUrl: {
//         type: Sequelize.STRING,
//         allowNull: false
//     },
//     description: {
//         type: Sequelize.STRING,
//         allowNull: false
//     }
// });
// module.exports = Product;
// const mongodb = require('mongodb');
// const { get } = require('../routes/shop');
// const getDb = require('../util/database').getDb;
// class Product{
//     constructor(title, price, description, imageUrl, id, userId) {
//         this.title = title;
//         this.price = price;
//         this.description = description; 
//         this.imageUrl = imageUrl;
//         this._id = id ? new mongodb.ObjectId(id) : null ;
//         this.userId = userId;
//     }
//     save(){
//         let dbOp;
//         const db = getDb();
//         if(this._id){
//             //Update the product
//             dbOp = db.collection('products').updateOne({_id: this._id},
//                 {$set: this});

//         }
//         else{
//             dbOp = db.collection('products').insertOne(this);
//         }
//         return dbOp
//             .then(result => {
//                 console.log(result);
//             })
//             .catch(err => console.log(err));
//     }

//     static fetchAll(){
//         const db = getDb();
//         return db.collection('products')
//             .find()
//             .toArray()
//             .then(products => {
//                 console.log(products);
//                 return products;
//             })
//             .catch(err => {
//                 console.log(err);
//             });
//     }
    
//     static findById(prodId){
//         const db = getDb();
//         return db.collection('products')
//             .find({_id: new mongodb.ObjectId(prodId)})
//             .next()
//             .then(products => {
//                 console.log(products);
//                 return products;
//             })
//             .catch(err => {
//                 console.log(err);
//             });
//     }
//     static deleteById(prodId){
//         const db = getDb();
//         return db.collection('products').deleteOne({_id: new mongodb.ObjectId(prodId)})
//             .then(result => {
//                 console.log("Deleted");
//             })
//             .catch(err => console.log(err))
//     }
// }
// module.exports = Product;


const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const productSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    price:{
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    imageUrl:{
        type: String,
        required: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',                            //Sets relation with User model
        required: true                                       
    }
});
module.exports = mongoose.model('Product', productSchema);
