const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

const Product = require('../models/product');
const Order = require('../models/order');

const ITEMS_PER_PAGE = 1;
exports.getProducts = (req, res, next) => {
    const Product = require('../models/product');
    const page = +req.query.page || 1;
    let totalItems;
    Product.find().countDocuments().then(numProducts => {
        totalItems = numProducts;
        return Product.find().skip((page-1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE)
    })
    .then(products => {
        res.render('shop/product-list',
        { 
            prods: products,
            pageTitle: 'Products',
            path: "/products",
            csrfToken: req.csrfToken(),
            currentPage: page,
            hasNextPage: ITEMS_PER_PAGE * page < totalItems,
            hasPreviousPage: page > 1,
            nextPage: page + 1,
            previousPage: page - 1,
            lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE)
        });        
            
    })
    .catch(err => {
        console.log(err)
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    })  
}

exports.getProduct = (req, res, next) => {
    const prodId = req.params.productId;
    Product.findById(prodId)
        .then(product => {
            res.render('shop/product-detail', 
            {
                product: product,
                pageTitle: product.title,
                path:'/products',
            });
        })     
        .catch(err => {
            console.log(err)
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        })  
}

exports.getIndex = (req, res, next) => {
    const Product = require('../models/product');
    const page = +req.query.page || 1;
    let totalItems;
    Product.find().countDocuments().then(numProducts => {
        totalItems = numProducts;
        return Product.find().skip((page-1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE)
    })
    .then(products => {
        res.render('shop/index',
        { 
            prods: products,
            pageTitle: 'Shop',
            path: "/",
            csrfToken: req.csrfToken(),
            currentPage: page,
            hasNextPage: ITEMS_PER_PAGE * page < totalItems,
            hasPreviousPage: page > 1,
            nextPage: page + 1,
            previousPage: page - 1,
            lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE)
        });        
            
    })
    .catch(err => {
        console.log(err)
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    })  
}

exports.getCart = (req, res, next) => {
 
    req.user
        .populate('cart.items.productId')
        .execPopulate()
                .then(user => {
                    const products = user.cart.items;
                    res.render('shop/cart',{
                        path: '/cart',
                        pageTitle: 'Your Cart',
                        products: products,
                        })
                    })
                    .catch(err => {
                        console.log(err)
                        const error = new Error(err);
                        error.httpStatusCode = 500;
                        return next(error);
                    })  
            
}

exports.postCart = (req, res, next) => {
    const prodId = req.body.prodId;

    const Product = require('../models/product');

    Product.findById(prodId)
        .then(product => {
            return req.user.addToCart(product);
        })
        .then(result => {
            console.log("Product added into cart");
            res.redirect('/cart');
        })
        .catch(err => {
            console.log(err)
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        })  
} 

exports.postCartDeleteProduct = (req, res, next) => {
    const prodId = req.body.productId;

    req.user
        .deleteItemFromCart(prodId)
            .then(result => {
                res.redirect('/cart');
            })
            .catch(err => {
                console.log(err)
                const error = new Error(err);
                error.httpStatusCode = 500;
                return next(error);
            })  
    
};

exports.getCheckout = (req, res, next) => {
    req.user
    .populate('cart.items.productId')
    .execPopulate()
    .then(user => {
        const products = user.cart.items;
        let total = 0;
        products.forEach(p => {
            total += p.quantity * p.productId.price;
        });
        res.render('shop/checkout',{
            path: '/checkout',
            pageTitle: 'Checkout',
            products: products,
            totalSum: total
            })
        })
    .catch(err => {
        console.log(err)
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    })  
}

exports.postOrder = (req, res, next) => {
    req.user
    .populate('cart.items.productId')
    .execPopulate()
        .then(user => {
            const products = user.cart.items.map(i => {
                return {quantity: i.quantity, product: {...i.productId._doc}};
            })
            const order = new Order({
                user: {
                    name: req.session.user.name,
                    userId: req.session.user
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
        .catch(err => {
            console.log(err)
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        })  

}
exports.getOrders = (req, res, next) => {
    Order.find({"user.userId": req.session.user})
        .then(orders => {
            res.render('shop/orders',{
                path: '/orders',
                pageTitle: 'Your Orders',
                orders: orders,
            });     
        })
        .catch(err => {
            console.log(err)
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        })  

}

function readInvoice(invoicePath, cb){
    const data = fs.readFile(invoicePath, (err,data) => {
        if(!err){
            cb(data);
        }
        else {
            throw new Error(err);
        }
    });
}
exports.getInvoice = (req, res, next) => {
    const orderId = req.params.orderId;
    Order.findById(orderId)
        .then(order => {
            if(!order){
                return next(new Error('no error found'));
            }
            if(order.user.userId.toString() !== req.user._id.toString()){
                return next(new Error('Unauthorized'));
            }
            const invoiceName = 'invoice-' + orderId +'.pdf';
            const invoicePath = path.join('data','invoices',invoiceName);

            const pdfDoc = new PDFDocument();
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'inline; filename="' + invoiceName + '"'); //View as pdf
            pdfDoc.pipe(fs.createWriteStream(invoicePath));
            pdfDoc.pipe(res);
            pdfDoc.fontSize(26).text('Invoice',{ underline: true });
            pdfDoc.text('------------------------------');
            let totalPrice = 0.0;
            order.products.forEach(prod => {
                totalPrice += prod.quantity * prod.product.price; 
                pdfDoc.fontSize(14).text(prod.product.title + ' - '+ prod.quantity + ' x ' + 'Rs. ' + prod.product.price);
            });
            pdfDoc.text('Total Price: Rs.' + totalPrice);

            // pdfDoc.text('Hello World!');
            pdfDoc.end();
            // fs.readFile(invoicePath, (err, data) => {
            //     if(err){
            //         console.log(err);
            //         return next(err);
            //     }
            // readInvoice(invoicePath, (data) => {
            //     console.log(data);
            //     res.setHeader('Content-Type', 'application/pdf');
            //     // res.setHeader('Content-Disposition', 'attachment; filename="' + invoiceName + '"'); //download attachment
            //     res.setHeader('Content-Disposition', 'inline; filename="' + invoiceName + '"'); //View as pdf
            //     res.send(data);
        
            // });


            // const file = fs.createReadStream(invoicePath);          //Bigger files are read in chunks
            // res.setHeader('Content-Type', 'application/pdf');
            // res.setHeader('Content-Disposition', 'inline; filename="' + invoiceName + '"'); //View as pdf
            // file.pipe(res);


        })
        .catch(err => next(err));
    } 
