const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator/check');
const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport'); 
const User = require('../models/user');
const crypto = require('crypto');

const transporter = nodemailer.createTransport(sendgridTransport({
    auth: {
        api_key: process.env.MAIL_API_KEY
    }
}));
exports.getLogin = (req, res, next) => {
    let message = req.flash('error');
    if(message.length > 0){
        message = message[0];
    }
    else{
        message = null;
    }
    res.render('auth/login',{
        path: '/login',
        pageTitle: 'Login',
        errorMessage: message
    });     
}
exports.postLogin = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(422).render('auth/signup',{
            path: '/signup',
            pageTitle: 'Signup',
            errorMessage: errors.array()[0].msg,
        });
    }
    User.findOne({email: email})
        .then(user => {
            if(!user){
                req.flash('error','Invalid email or password!!')
                return res.redirect('/login');
            }
            bcrypt
                .compare(password, user.password)
                .then(doMatch => {
                    if(doMatch){
                        req.session.isLoggedIn = true;
                        req.session.user = user;
                        return req.session.save((err) => {
                            console.log(err);
                            res.redirect('/');      
                        })
                    }
                    else{
                        req.flash('error','Invalid email or password!!');
                        res.redirect('/login');
                    }
                })
                .catch(err => {
                    console.log(err);
                    res.redirect('/login');
                });
        })
        .catch(err => {
            console.log(err)
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        })
};
exports.postLogout = (req, res, next) => {
    req.session.destroy((err) => {
        console.log(err);
        res.redirect('/');
    });
};
exports.getSignup = (req, res, next) => {
    let message = req.flash('error');
    if(message.length > 0){
        message = message[0];
    }
    else{
        message = null;
    }
    res.render('auth/signup',{
        path: '/signup',
        pageTitle: 'Signup',
        errorMessage: message,
        oldInput: {
            email: '',
            name: '',
            password: '',
            confirmPassword: ''
        },
        validationErrors: []
    });};
exports.postSignup = (req, res, next) => {
    const errors = validationResult(req);
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;
    if(!errors.isEmpty()) {
        return res.status(422).render('auth/signup',{
            path: '/signup',
            pageTitle: 'Signup',
            errorMessage: errors.array()[0].msg,
            oldInput: {email: email, password: password, name: name,
                 confirmPassword: req.body.confirmPassword},
            validationErrors: errors.array()
        });
    }
    bcrypt.hash(password, 12)
        .then(hashedPassword => {
            const user = new User({
                name: name,
                email: email,
                password: hashedPassword,
                cart: { items: []}
            });
            return user.save();
    }).then(result => {
        transporter.sendMail({
            to: email,
            from: 'rprakeshprasad00@gmail.com',
            subject: 'Signup succeeded!!',
            html: '<h1> You successfully signed up!</h1>'
        })
        res.redirect('/login');
        })
        .catch(err => {
            console.log(err)
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

    
exports.getReset = (req, res, next) => {
    let message = req.flash('error');
    if(message.length > 0){
        message = message[0];
    }
    else{
        message = null;
    }
    res.render('auth/reset',{
        path: '/reset',
        pageTitle: 'Reset Password',
        errorMessage: message,
    });
};
exports.postReset = (req, res, next) => {
    crypto.randomBytes(32, (err, buffer) => {
        if(err){
            console.log(err);
            return res.redirect('/reset');
        }
        const token = buffer.toString('hex');
        User.findOne({email: req.body.email})
            .then(user => {
                if(!user){
                    req.flash('error','No account with this email found!');
                    return res.redirect('/reset');
                }
                user.resetToken = token;
                user.resetTokenExpiration = Date.now() + 3600000;
                return user.save();
            })
            .then(result => {
                res.redirect('/');
                console.log(process.env.MAIL_API_KEY);
                transporter.sendMail({
                    to: req.body.email,
                    from: 'rprakeshprasad00@gmail.com',
                    subject: 'Password reset!!',
                    html: `
                    <p>You required a password reset</p>
                    <p>Click this <a href="http://localhost:4000/reset/${token}">link to set a new password</p>`
                })
            })
            .catch(err => {
                console.log(err)
                const error = new Error(err);
                error.httpStatusCode = 500;
                return next(error);
            })
    })
};
exports.getNewPassword = (req, res, next) => {
    const token = req.params.token;
    User.findOne({resetToken: token, resetTokenExpiration: {$gt: Date.now()}})
        .then(user => {
            let message = req.flash('error');
            if(message.length > 0){
                message = message[0];
            }
            else{
                message = null;
            }
            console.log(user);
            res.render('auth/new-password',{
                path: '/new-password',
                pageTitle: 'New Password',
                errorMessage: message,
                passwordToken: token,
                userId: user._id.toString()
            });    
        })
        .catch(err => {
            console.log(err)
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        })   
}

exports.postNewPassword = (req, res, next) => {
    const newPassword = req.body.password;
    const userId = req.body.userId;
    const passwordToken = req.body.passwordToken;
    let resetUser;
    console.log(passwordToken);
    User.findOne({resetToken: passwordToken, resetTokenExpiration: {$gt: Date.now()}})
        .then(user => {
           console.log(user); 
           resetUser = user;
           return bcrypt.hash(newPassword, 12)
        })
        .then(hashedPassword => {
            console.log(resetUser);
            resetUser.password = hashedPassword;
            resetUser.resetToken = undefined;
            resetUser.resetTokenExpiration = undefined;
            return resetUser.save();
        })
        .then(result => {
            res.redirect('/login');
        })
        .catch(err => {
            console.log(err)
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        })  
};