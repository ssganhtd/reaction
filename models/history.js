const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const config = require('../config/database');

// History Schema
const HistorySchema = mongoose.Schema({
  id_account: {
    type: String
  },
  id_status: {
    type: String
  },
  created: {
    type: Date,
    default: Date.now
  }
});

const History = module.exports = mongoose.model('History', HistorySchema);

module.exports.getListHistory = function(callback){
  History.find(callback);
}
module.exports.checkStatus = function(query, callback){
  History.findOne(query, callback);
}

module.exports.getHistoryById = function(id, callback){
  History.findById(id, callback);
}

module.exports.addHistory = function(newHistory, callback){
  newHistory.save(callback);
}

module.exports.deleteHistory = function(id, callback){
  History.findByIdAndRemove(id, callback);
}
