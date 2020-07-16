const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');
const User = require('../models/user');
const { check, body } = require('express-validator/check');
router.get('/login', authController.getLogin);
router.post('/login', authController.postLogin);
router.post('/logout', authController.postLogout);
router.get('/signup',authController.getSignup);
router.post('/signup',[
 check('email')
 .isEmail()
 .withMessage('Please enter a valid email')
 .custom((value, {req}) => {
    return User.findOne({email: value})
        .then(userDoc => {
            if(userDoc){
                return Promise.reject('Email already exists!!');
            }
        });
    }).normalizeEmail(),
 body('password','Please enter password > then 5 char and use only alphanumeric char')
    .isLength({min: 5})
    .isAlphanumeric().trim(),
body('confirmPassword').trim()
 .custom((value, {req})=> {
     if(value !== req.body.password){
        throw new Error("passwords have to match!");
     }
     return true;
 }),
]
,authController.postSignup);
router.get('/reset', authController.getReset);
router.post('/reset', authController.postReset);
router.get('/reset/:token', authController.getNewPassword);
router.post('/new-password', authController.postNewPassword);

module.exports = router;