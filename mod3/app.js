const path = require('path');
const express = require('express');
const app = express();
const feedRoutes = require('./routes/feed');
const authRoutes = require('./routes/auth');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const multer = require('multer');
const fileStorage  = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images');
    },
    filename: (req, file, cb) => {
        cb(null, new Date().toISOString() + '-' + file.originalname);
    }
});

const fileFilter = (req, file, cb) => {
    if(file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg'){
        cb(null, true);        
    }else{
        cb(null, false);
    }
}
app.use(bodyParser.json());
app.use(multer({storage: fileStorage, fileFilter: fileFilter}).single('image'))
app.use('/images', express.static(path.join(__dirname,'images')));
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin','*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
})
app.put('/path');
app.use('/feed',feedRoutes);
app.use('/auth',authRoutes);
app.use((error, req, res, next) => {
    console.log(error);
    const status = error.statusCode || 500;
    const message = error.message;
    const data = error.data;
    res.status(status).json({message: message, data: data});
});
mongoose.connect("mongodb+srv://user:Vyio62CKbH67sFrr@cluster0.ekyqa.mongodb.net/messages")
    .then(result => {
        const server = app.listen(8000)
        const io = require('./socket').init(server);      // Web sockets built over http
        io.on('connection', socket => {
            console.log('Client connected!')
        });
    })
    .catch(err => console.log(err)); 