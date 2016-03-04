var bluebird = require('bluebird');
var Mongoose = require('mongoose');

var url = 'mongodb://localhost/test';
Mongoose.connect(url, { promiseLibrary: bluebird });

var db = Mongoose.connection;
db.on('error', console.error.bind(console, 'connection error'));

exports.Mongoose = Mongoose;
exports.db = db;