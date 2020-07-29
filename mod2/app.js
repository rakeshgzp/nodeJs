const express = require('express');
const path = require('path');
const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const fs = require('fs');
// const dotenv = require('dotenv');
const app = express();
const bodyParser = require('body-parser');
const errorController = require('./controllers/error');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStrore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const flash = require('connect-flash');
const User = require('./models/user'); 
const multer = require('multer');
const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images');
    },
    filename: (req, file, cb) => {
        cb(null, new Date().toISOString() + '-' + file.originalname);
    }
})
// dotenv.config();
const MONGODB_URI = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.ekyqa.mongodb.net/${process.env.MONGO_DATABASE}`;    
console.log(MONGODB_URI);
const store = new MongoDBStrore({
    uri: MONGODB_URI,
    collection: 'sessions'
});
const fileFilter = (req, file, cb) => {
    if( file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg'){
        cb(null, true);
    }
    else{
        cb(null, false);
    }
}
const accessLogStream = fs.createWriteStream(
    path.join(__dirname, 'access.log'),
    { flags: 'a'}
);
const csrfProtection = csrf();
app.set('view engine','ejs');
app.set('views','views');
app.use(helmet());
app.use(compression());
app.use(morgan('combined', {stream: accessLogStream}))
app.use(bodyParser.urlencoded({extended:false}));
app.use(multer({ storage: fileStorage, fileFilter: fileFilter }).single('image'));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/images',express.static(path.join(__dirname, 'images')));
app.use(session({
    secret: 'some string', 
    resave: false, 
    saveUninitialized: false,
    store: store
}));
app.use(csrfProtection);
app.use(flash());
app.use((req, res, next) => {
    res.locals.isAuthenticated = req.session.isLoggedIn;
    res.locals.csrfToken = req.csrfToken();
    next();
})
app.use((req, res, next) => {
    if(!req.session.user){
        return next();
    }
    User.findById(req.session.user._id)
        .then(user => {
            if(!user){
                return next();
            }
            req.user = user;
            next();
        })
        .catch(err => {
            // throw new Error(err);         // this is inside promise/callback code and won't be detected by error middleware
            next(new Error(err));
        });
});
app.use('/admin',adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);
app.get('/500', errorController.get500);
app.use(errorController.get404);
app.use((error, req, res, next) => {
    // res.status(error.httpStatusCode).render(...);
    // res.redirect('/500');
    console.log(error);
    res.status(500).render('500',{pageTitle: "Server error!", path:"/500",
    isAuthenticated: req.session.isLoggedIn});

}); 
mongoose.connect(MONGODB_URI)
    .then(result => {
        app.listen(process.env.PORT);
    }).catch(err => console.log(err));







