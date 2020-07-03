const http = require('http');
const express = require('express');
const path = require('path');
const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const app = express();
const bodyParser = require('body-parser');
const errorController = require('./controllers/error');

app.set('view engine','ejs');
// app.set('view engine','pug');
app.set('views','views');
app.use(bodyParser.urlencoded({extended:false}));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/admin',adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);
app.listen(3000);