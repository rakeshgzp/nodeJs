const path = require('path');
const express = require('express');
const app = express();
const feedRoutes = require('./routes/feed');
const authRoutes = require('./routes/auth');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const multer = require('multer');
var { graphqlHTTP } = require('express-graphql');
const graphqlSchema = require('./graphql/schema');
const graphqlResolver = require('./graphql/resolvers');
const auth = require('./middleware/is-auth');

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
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
})
app.put('/path');
app.use('/feed',feedRoutes);
app.use('/auth',authRoutes);
app.use(auth);
app.use('/graphql', graphqlHTTP({
    schema: graphqlSchema,
    graphiql: true,
    rootValue: graphqlResolver,
    
    formatError(err) {
        if (!err.originalError){
            console.log(err);
            return err;
        }
        console.log(2);
        const data = err.originalError.data;
        const message = err.message || 'An error occurred.';
        console.log(err.originalError);
        const code = err.originalError.code || 500;
        return { message: message, status: code, data: data };
    }
})
);

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