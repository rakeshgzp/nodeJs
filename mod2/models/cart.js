// const fs = require('fs');
// const path = require('path');
// const p = path.join(path.dirname(process.mainModule.filename),
// 'data',
// 'cart.json'
// );

// const parseFileContent = (fc, cb) => {
//     const updatedCart = {...JSON.parse(fc)};
//     return cb(updatedCart);
// }
// module.exports = class Cart{
//     static addProduct(id, productPrice){
//         fs.readFile(p, (err,fileContent) => {
//              let cart = {products: [], totalPrice: 0}
//              if(!err){
//                  cart = JSON.parse(fileContent);
                  
//              }
//         const existingProductIndex = cart.products.findIndex(prod => prod.id === id);
//         const existingProduct = cart.products[existingProductIndex];
//         let updatedProduct;
//         if(existingProduct){
//             updatedProduct = {...existingProduct};
//             updatedProduct.qty = updatedProduct.qty + 1;
//             cart.products = [...cart.products];
//             cart.products[existingProductIndex] = updatedProduct;

//         }else{
//             updatedProduct = {id: id, qty: 1};
//             cart.products = [...cart.products, updatedProduct];
//         }
//         cart.totalPrice = cart.totalPrice + +productPrice;
//         fs.writeFile(p, JSON.stringify(cart), (err) => {
//             console.log(err);
//         })
//         })
//     }
//     static deleteProduct(id, productPrice){
//         fs.readFile(p, (err, fileContent) => {
//             if(err){
//                 return;
//             }
//             parseFileContent(fileContent, (updatedCart) =>{
//                 const product = updatedCart.products.find(prod => prod.id === id);
//                 if (!product){
//                     return;
//                 }
//                 const prodQty = product.qty;
//                 updatedCart.products = updatedCart.products.filter(prod => prod.id !== id);
//                 updatedCart.totalPrice = updatedCart.totalPrice - productPrice * prodQty;
//                 fs.writeFile(p, JSON.stringify(updatedCart), (err) => {
//                     console.log(err);
//                 })
    
//             } );
    
//         })
//     }

//     static getCart(cb){
//         fs.readFile(p, (err, fileContent) => {
//             const cart = JSON.parse(fileContent)
//             if(err){
//                 cb(null);
//             }
//             else{
//                 cb(cart);
//             }
//         });
//     }
// }



const Sequelize = require('sequelize');
const sequelize = require('../util/database');

const Cart = sequelize.define('cart',{
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    }
});
module.exports = Cart;
