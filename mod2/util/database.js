// const mysql = require('mysql2');
// const pool = mysql.createPool({
//     host: 'localhost',
//     user: 'root',
//     database: 'node_complete',
//     password: 'easy'
// }); 
// module.exports = pool.promise();



// const Sequelize = require('sequelize');
// const sequelize = new Sequelize('node_complete','root','easy', {
//     dialect: 'mysql',
//     host: 'localhost'
// });
 
// module.exports = sequelize;


let _db;

const mongoConnect = (callback) => {
    const mongodb = require('mongodb');                //mongodb package
    const MongoClient = mongodb.MongoClient;             //constructor 
    MongoClient.connect("mongodb+srv://user1:NlqAN1JAwZzfLFkP@cluster0.ekyqa.mongodb.net/shop?retryWrites=true&w=majority", { useUnifiedTopology: true })
        .then(client => {
            console.log('Connected to db');
            _db = client.db();
            callback();
        })
        .catch(err => {
            console.log(err);
            throw err;
        });
};

const getDb = () => {
    if(_db) {
        return _db;
    }    
    throw 'No database found';
}

exports.mongoConnect = mongoConnect;
exports.getDb = getDb;