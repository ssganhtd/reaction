const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const passport = require('passport');
const mongoose = require('mongoose');
const config = require('./config/database');
const app = express();
const users = require('./routes/users');
const accounts = require('./routes/accounts');
const engines = require('consolidate');
const request = require('request');
const port = process.env.PORT || 80;
const Accounts = require('./models/accounts');
const History = require('./models/history');
var cron = require('node-cron');
cron.schedule('*/1 * * * *', function(){
    runCron();
});

mongoose.Promise = global.Promise;
mongoose.connect(config.database, { useMongoClient: true });
mongoose.connection.on('connected', () => {
  console.log('Đã kết nối tới:  '+config.database);
});
mongoose.connection.on('error', (err) => {
  console.log('Lỗi database: '+err);
});

app.use(cors());
app.use(express.static(path.join(__dirname, 'client')));
app.use(bodyParser.json());
app.use(passport.initialize());
app.use(passport.session());
require('./config/passport')(passport);
app.use('/users', users);
app.use('/accounts', accounts);


app.set('client', __dirname + '/client');
app.engine('html', engines.mustache);
app.set('view engine', 'html');
app.get('/', function(req, res) {
    res.render('index');
});

function runCron(){
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
          var urlGetFeeds = 'https://graph.facebook.com/me/home?limit=1&access_token=' + token;
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
}
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
// Start Server
app.listen(port, () => {
  console.log('Server da chay '+port);
});
