// const path = require('path');
const express = require('express');
// const adminData = require('./admin');
const router = express.Router();
// const rootDir = require('../util/path');
const isAuth = require('../middleware/is-auth');
const shopController = require('../controllers/shop')
router.get('/', shopController.getIndex);
router.get('/products', shopController.getProducts);
router.get('/cart', isAuth, shopController.getCart);
router.post('/cart', isAuth, shopController.postCart);
router.get('/products/:productId', shopController.getProduct);
router.get('/orders', isAuth, shopController.getOrders);
// // // router.get('/checkout',shopController.getCheckout);
router.post('/cart-delete-item', isAuth, shopController.postCartDeleteProduct);
router.post('/create-order', isAuth, shopController.postOrder);
module.exports = router;
