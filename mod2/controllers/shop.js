const Product = require('../models/product');
const Order = require('../models/order');
// const Order = require('../models/order');

// exports.getProducts = (req, res, next) => {
//     Product.fetchAll((products) => {
//         res.render('shop/product-list',
//         { prods: products,
//         pageTitle: 'All Products',
//         path: "/products",
//         });
//     });
// }

exports.getProducts = (req, res, next) => {
    // Product.findAll()
    //     .then(products => {
    //         res.render('shop/product-list',
    //         { prods: products,
    //         pageTitle: 'All Products',
    //         path: "/products",
    //         });            
    //     })
    //     .catch(err => {
    //         console.log(err);
    //     });
    const Product = require('../models/product');
 
    Product.find()
    .then((products) => {                       //Destructuring of array
        res.render('shop/product-list',
        { prods: products,
        pageTitle: 'All Products',
        path: "/products",
        });
    })
    .catch(err => console.log(err));


}



// exports.getProduct = (req, res, next) => {
//     const prodId = req.params.productId;
//     Product.findById(prodId, product => {
//         res.render('shop/product-detail', 
//         {product: product,
//         pageTitle: product.title,
//         path:'/products'
//         });
//     })
// }


exports.getProduct = (req, res, next) => {
    const prodId = req.params.productId;
    Product.findById(prodId)
        .then(product => {
            res.render('shop/product-detail', 
            {
                product: product,
                pageTitle: product.title,
                path:'/products'
            });
        })     
        .catch(err => console.log(err))
}




// exports.getIndex = (req, res, next) => {
//     Product.fetchAll((products) => {
//         res.render('shop/index',
//         { prods: products,
//         pageTitle: 'Shop',
//         path: "/",
//         });
//     });

// }

exports.getIndex = (req, res, next) => {
    const Product = require('../models/product');

    Product.find()
        .then(products => {
            res.render('shop/index',
            { 
                prods: products,
                pageTitle: 'Shop',
                path: "/",
            });        
                
        })
        .catch(err => {
            console.log(err);
        });
    }



//     Product.fetchAll()
//     .then(([rows, fieldData]) => {                       //Destructuring of array
//         res.render('shop/index',
//         { 
//             prods: rows,
//             pageTitle: 'Shop',
//             path: "/",
//         });        
//     })                      
//     .catch(err => console.log(err));

// }



exports.getCart = (req, res, next) => {
 
    // req.user.getCart()
    //     .then(cart => {
    //         return cart.getProducts()
    //             .then(products => {
    //                 res.render('shop/cart',{
    //                     path: '/cart',
    //                     pageTitle: 'Your Cart',
    //                     products: products
    //                     })
    //                 })
    //             .catch(err => console.log(err));
    //     })
    //     .catch(err => console.log(err))

    // Cart.getCart(cart => {
    //     Product.fetchAll(products => {
    //         const cartProducts = [];
    //         for (product of products){
    //             const cartProductsData = cart.products.find(prod => prod.id === product.id)
    //             if(cartProductsData){
    //                 cartProducts.push({productData: product, qty: cartProductsData.qty});
    //             }
    //         }
    //         res.render('shop/cart',{
    //             path: '/cart',
    //             pageTitle: 'Your Cart',
    //             products: cartProducts
    //     })
    //     });
   
    // });

    // req.user
    //     .getCart()
    //             .then(products => {
    //                 res.render('shop/cart',{
    //                     path: '/cart',
    //                     pageTitle: 'Your Cart',
    //                     products: products
    //                     })
    //                 })
    //             .catch(err => console.log(err));
        
    req.user
        .populate('cart.items.productId')
        .execPopulate()
                .then(user => {
                    const products = user.cart.items;
                    res.render('shop/cart',{
                        path: '/cart',
                        pageTitle: 'Your Cart',
                        products: products
                        })
                    })
                .catch(err => console.log(err));

}

exports.postCart = (req, res, next) => {
    const prodId = req.body.prodId;

    // let newQuantity = 1;
    // let fetchedCart;
    // req.user
    //     .getCart()
    //     .then(cart => {
    //         fetchedCart = cart;
    //         return cart.getProducts({where: {id: prodId}})
    //     })
    //     .then(products => {
    //         let product;
    //         if (products.length > 0)
    //         {
    //             product = products[0];
    //         }
    //         if (product){
    //             const oldQuantity = product.cartItem.quantity;
    //             newQuantity = oldQuantity + 1;
    //             return product;
    //         } 
    //         return Product.findByPk(prodId);
    //     })
    //         .then(product => {
    //             return fetchedCart.addProduct(product,
    //                  { through : { quantity: newQuantity}});
    //         })
    //         .then(() => {
    //             res.redirect('/cart');
    //         })
    //         .catch(err => console.log(err));



    // Product.findById(prodId, (product) => {
    //     Cart.addProduct(prodId, product.price);
    // })
    // console.log(prodId);
    // res.redirect('/cart');
    const Product = require('../models/product');

    Product.findById(prodId)
        .then(product => {
            return req.user.addToCart(product);
        })
        .then(result => {
            console.log("Product added into cart");
            res.redirect('/cart');
        })
        .catch()
} 

exports.postCartDeleteProduct = (req, res, next) => {
    const prodId = req.body.productId;


    // req.user.getCart()
    //     .then(cart => {
    //         return cart.getProducts({ where: {id: prodId }});
    //     })
    //     .then(products => {
    //         const product = products[0];
    //         return product.cartItem.destroy();
    //     })
    //     .then(result => {
    //         res.redirect('/cart');
    //     })
    //     .catch(err => console.log(err));
 
    // Product.findById(prodId, product => {
    //     Cart.deleteProduct(prodId, product.price);
    //     res.redirect('/cart');
    // });

    req.user
        .deleteItemFromCart(prodId)
            .then(result => {
                res.redirect('/cart');
            })
            .catch(err => {
                console.log(err);
            })

};

exports.postOrder = (req, res, next) => {
    // let fetchedCart;
    // req.user.getCart()
    //     .then(cart => {
    //         fetchedCart = cart;
    //         return cart.getProducts();
    //     })
    //     .then(products => {
    //         return req.user.createOrder()
    //         .then(order => {
    //             return order.addProducts(products.map(product => {
    //                 product.orderItem = { quantity: product.cartItem.quantity};
    //                 return product;
    //             }));
    //         })
    //         .catch(err => console.log(err));
    //     })
    //     .then(result => {
    //         return fetchedCart.setProducts(null);
    //     })
    //     .then(result => {
    //         res.redirect('/orders');
    //     })
    //     .catch(err => console.log(err))
    req.user
    .populate('cart.items.productId')
    .execPopulate()
        .then(user => {
            console.log(user.cart.items);
            const products = user.cart.items.map(i => {
                return {quantity: i.quantity, product: {...i.productId._doc}};
            })
            const order = new Order({
                user: {
                    name: req.user.name,
                    userId: req.user
                },
                products: products
            });
        return order.save();
            })    
        .then(result => {
            return req.user.clearCart();
        })
        .then(() => {
            res.redirect('/orders');
        })
        .catch(err => console.log(err))

}


// exports.getCheckout = (req, res, next) => {
//     res.render('shop/checkout',{
//         path: '/checkout',
//         pageTitle: 'Checkout'
//     })
// }
exports.getOrders = (req, res, next) => {
    // req.user.getOrders({ include: ['products']})
    //     .then(orders => {
    //         res.render('shop/orders',{
    //             path: '/orders',
    //             pageTitle: 'Your Orders',
    //             orders: orders
    //         });     
    //     })
    //     .catch(err => console.log(err))
    Order.find({"user.userId": req.user})
        .then(orders => {
            res.render('shop/orders',{
                path: '/orders',
                pageTitle: 'Your Orders',
                orders: orders
            });     
        })
        .catch(err => console.log(err))

}
