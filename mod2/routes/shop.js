// const path = require('path');
const express = require('express');
// const adminData = require('./admin');
const router = express.Router();
// const rootDir = require('../util/path');
const shopController = require('../controllers/shop')
router.get('/', shopController.getIndex);
router.get('/products',shopController.getProducts);
router.get('/cart',shopController.getCart);
router.post('/cart', shopController.postCart);
router.get('/products/:productId', shopController.getProduct);
router.get('/orders',shopController.getOrders);
// router.get('/checkout',shopController.getCheckout);
router.post('/cart-delete-item', shopController.postCartDeleteProduct);
router.post('/create-order', shopController.postOrder);
module.exports = router;
