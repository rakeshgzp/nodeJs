const Product = require('../models/product');
const { request } = require('express');
const product = require('../models/product');
exports.getAddProduct = (req, res, next) => {
    res.render('admin/edit-product',
    {pageTitle: 'Add Product',
    path:'/admin/add-product',
    editing: false,
    isAuthenticated: req.session.isLoggedIn
});
}

exports.postAddProduct = (req,res,next)=>{
    const title = req.body.title;
    const imageUrl = req.body.imageUrl;
    const price = req.body.price;
    const description = req.body.description;
    // const product = new Product(title, price, description, imageUrl, null, req.user._id);

    const product = new Product({
        title: title,
        price: price,
        description: description, 
        imageUrl: imageUrl,
        userId: req.user._id          // or use req.user
    });
    // const product = new Product(null, title, imageUrl, description, price);
    // product.save()
    // .then(() => {
    //     res.redirect('/');
    // })
    // .catch(err => console.log(err));
    // res.redirect('/');


    // req.user
    //     .createProduct({                          //Feature of sqeuelize as we have used Productbelongsto(Users)
    //         title: title,
    //         price: price,
    //         description: description,
    //         imageUrl: imageUrl
    //     })
    //     .then(result => {
    //         console.log("Created Product");
    //         res.redirect('/admin/products');
    //     })
    //     .catch((err) => console.log(err));


    product
        .save()
        .then(result => {
            console.log("Created Product");
            res.redirect('/admin/products');
        })
        .catch((err) => console.log(err));

}

exports.getEditProduct = (req, res, next) => {
    const editMode = req.query.edit;

    if( !editMode){
        return res.redirect('/');
    }
    const prodId = req.params.productId;
    Product.findById(prodId)
    // req.user.getProducts({ where: {id: prodId}})
        .then(product => {
            // product = products[0]
            if (!product){
                return res.redirect('/');
            }
            res.render('admin/edit-product',
            {
                pageTitle: 'Edit Product',
                path:'/admin/edit-product',
                editing: editMode,
                product: product,
                isAuthenticated: req.session.isLoggedIn
            });            
        })
        .catch(err => console.log(err))

    // Product.findById(prodId, product => {
    //     if (!product){
    //         return res.redirect('/');
    //     }
    //     res.render('admin/edit-product',
    //     {
    //         pageTitle: 'Edit Product',
    //         path:'/admin/edit-product',
    //         editing: editMode,
    //         product: product
    //     });
    // });
 
}
exports.postEditProduct = (req, res, next) => {
    const prodId = req.body.productId;
    const updatedTitle = req.body.title;
    const updatedPrice = req.body.price;
    const updatedImageUrl = req.body.imageUrl;
    const updatedDesc = req.body.description;
    // const updatedProduct = new Product(prodId, updatedTitle, updatedImageUrl, updatedDesc, updatedPrice);
    // updatedProduct.save();

    // Product.findById(prodId)
    //     const product = new Product(updatedTitle, updatedPrice,  updatedDesc, updatedImageUrl, prodId);
    //     product.save().then(result => {
    //         console.log("Updated Product")
    //         res.redirect('/admin/products');
    //     })
    //     .catch(err => console.log(err))

    Product.findById(prodId).then(product => {
        product.title = updatedTitle;
        product.price = updatedPrice;
        product.description = updatedDesc;
        product.imageUrl = updatedImageUrl;
        return product.save()
    })
    .then(result => {
            console.log("Updated Product")
            res.redirect('/admin/products');
        })
        .catch(err => console.log(err))
}

exports.getProducts = (req, res, next)=>{
    // Product.findAll()
    // req.user.getProducts()
    //     .then((products) => {
    //         res.render('admin/products',
    //         { prods: products,
    //         pageTitle: 'Admin Products',
    //         path: "/admin/products",
    //         });
    //       })
    //     .catch(err => console.log(err))

    Product.find()
        // .select('title proce -_id')    //choose fields u want 
        // .populate('userId', 'name')            // Adds additional info using relations and selected name only out of it
        .then((products) => {
            res.render('admin/products',
            { prods: products,
            pageTitle: 'Admin Products',
            path: "/admin/products",
            isAuthenticated: req.session.isLoggedIn
            });
        })
        .catch(err => console.log(err));
}
exports.deleteProduct = (req, res, next) => {
    const prodId = req.body.productId;
    Product.findByIdAndRemove(prodId)    
        .then(() => {
            res.redirect('/admin/products');           
        })
        .catch(err => console.log(err))
}