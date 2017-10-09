const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const config = require('../config/database');

// User Schema
const AccountSchema = mongoose.Schema({
  idfb: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  reaction: {
    type: String,
    required: true
  },
  token: {
    type: String,
    required: true,
    unique: true
  },
  status: {
    type: Number,
    default: 1
  },
  created: {
    type: Date,
    default: Date.now
  }
});

const Account = module.exports = mongoose.model('Account', AccountSchema);

module.exports.getListAccount = function(callback){
  Account.find(callback);
}

module.exports.getListAccountLive = function(callback){
  const query = {status: 1}
  Account.find(query, callback);
}

module.exports.getAccountById = function(id, callback){
  Account.findById(id, callback);
}

module.exports.getAccountByToken = function(token, callback){
  const query = {token: token}
  Account.findOne(query, callback);
}

module.exports.addAccount = function(newAccount, callback){
  newAccount.save(callback);
}

module.exports.updateStatus = function(query, data, callback){
  Account.update(query, { $set: data }, callback);
}
module.exports.deleteAccount = function(id, callback){
  Account.findByIdAndRemove(id, callback);
}
