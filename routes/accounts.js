const https = require('https');
const express = require('express');
const router = express.Router();
const config = require('../config/database');
const Accounts = require('../models/accounts');
const History = require('../models/history');
const request = require('request');

router.get('/', (req, res, next) => {
  Accounts.getListAccount((err, listAccount) =>{
    if(err) throw err;
    res.json(listAccount);
  });
});

router.post('/add', (req, res, next) => {
  if(!req.body.token){
    return res.json({success: false, msg:'Bạn chưa nhập Access token'});
  }
  if(!req.body.reaction){
    return res.json({success: false, msg:'Bạn chưa chọn reactions'});
  }

  const token = req.body.token;
  const reaction = req.body.reaction;

  request('https://graph.facebook.com/me?access_token='+token, function (error, response, body) {
    body = JSON.parse(body);
    if(body.error){
      return res.json({success: false, msg: 'Access token die hoặc không có quyền'});
    } else {
      const idfb = body.id;
      const name = body.name;
      Accounts.getAccountByToken(token, (err, account) =>{
        if(account)
          return res.json({success: false, msg: 'Access token này đã có trong hệ thống'});
        else{
          var newAccount = new Accounts({
            idfb: idfb,
            name: name,
            reaction: reaction,
            token: token
          });
          Accounts.addAccount(newAccount, (err, user) => {
            if(err){
              res.json({success: false, msg:'Đã xảy ra lỗi, không thể thêm'});
            } else {
              res.json({success: true, msg:'Thêm thành công tài khoản: ' + name});
            }
          });
        }
      });
    }
  });  
});

router.post('/delete', (req, res, next) => {
  if(!req.body.id){
    return res.json({success: false, msg:'Phải nhập tài khoản mới xóa được'});
  }
  const id = req.body.id;
  Accounts.getAccountById(id, (err, account) =>{
    if(!account)
      return res.json({success: false, msg: 'Không tồn tại tài khoản này'});
    else{
      Accounts.deleteAccount(id, (err, user) => {
        if(err){
          res.json({success: false, msg:'Đã xảy ra lỗi, không thể xóa'});
        } else {
          res.json({success: true, msg:'Đã xóa thành công tài khoản: ' + user.name});
        }
      });
    }
  })
});

router.get('/run', (req, res, next) =>{
  Accounts.getListAccountLive((err, listAccount) =>{
    if(err) throw err;
    listAccount.forEach(function(index, el) {
      var id_account = index._id;
      var token = index.token;
      var reaction = index.reaction;
      //kiem tra token die thi update lai status
      request('https://graph.facebook.com/me?access_token='+token, function (error, response, body) {
        body = JSON.parse(body);
        if(body.error){
          var query = {token: token};
          var data = {status: 0};
          Accounts.updateStatus(query, data, () => {});
        } else {
          //get bài viết mới trên trang chủ
          var urlGetFeeds = 'https://graph.facebook.com/me/friends?limit=1&access_token=' + token;
          request(urlGetFeeds, function (error, response, body) {
            body = JSON.parse(body);
            if(body.error){
              var query = {token: token};
              var data = {status: 0};
              Accounts.updateStatus(query, data, () => {});
            } else {
              if(body.data.length > 0){
                var id = body.data["0"].id;
                var query = {
                  id_account: id_account,
                  id_status: id
                }
                History.checkStatus(query, (err, history)=>{
                  if(history){
                    console.log('Exitst: ' + id);
                  } else{
                    runReaction(id_account, token, id, reaction);
                  }
                });
              } else{
                console.log('Can not get new');
              }
            }
          });  
        }
      });  
    });
  });
});

function runReaction(id_account, token, id, reaction){
  var url = 'https://graph.facebook.com/'+id+'/reactions?type='+reaction+'&method=post&access_token='+token;
  request(url, function (error, response, body) {
    body = JSON.parse(body);
    if(body.error){
      console.log('Error id: ' + id + ' msg: ' + body.error.message);
    } else{
      console.log(reaction + ' done id: ' + id);
      var newHistory = new History({
        id_account: id_account,
        id_status: id
      });
      History.addHistory(newHistory, (err, user) => {
        if(err){
          console.log('Can not add history: ' + id);
        } else {
          console.log('Add new history: ' + id);
        }
      });
    }
  });  
}
module.exports = router;
