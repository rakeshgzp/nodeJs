// const mysql = require('mysql2');
// const pool = mysql.createPool({
//     host: 'localhost',
//     user: 'root',
//     database: 'node_complete',
//     password: 'easy'
// }); 
// module.exports = pool.promise();



const Sequelize = require('sequelize');
const sequelize = new Sequelize('node_complete','root','easy', {
    dialect: 'mysql',
    host: 'localhost'
});