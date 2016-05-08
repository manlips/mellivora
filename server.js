var express = require('express');
var app = express();
var CronJob = require('cron').CronJob;
var sql = require("./mysql.js");
var mysql = require("mysql");
var fs = require("fs");

// First you need to create a connection to the db
var connection = mysql.createConnection({
  host: "52.31.79.0",
  user: "KingOfBees",
  password: "LotusFlower5:01",
  database: "cowriedb"
});

connection.connect(function(error){
  if(error){
    console.log('*DBConnect*: Error connecting to Db: ' + error.stack);
    //Error: Cannot enqueue Handshake after invoking quit.
    return;
  }
  console.log('*DBConnect*: Connection to DB established with ID: ' + connection.threadId);
});

//makes it a little more secure, stops user seeing header
app.disable('x-powered-by');

var handlebars = require('express-handlebars').create({defaultLayout:'main'});

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

//More imports later

app.set('port', process.env.PORT || 3000);

app.use(express.static(__dirname + '/public'));


// This responds with "Hello World" on the homepage
app.get('/', function (req, res) {
   console.log("Got a GET request for the homepage");
   res.render('overview');
});

app.use(function(req, res, next) {
  console.log("Looking for URL: " + req.url);
  next();
});

app.use(function(err, req, res, next) {
  console.log("Error: " + err.message);
  next();
});

app.get('/dailystats', function(req, res, next) {
  console.log("Got a GET request for /dailystats");
  res.render('dailystats');
});

app.get('/table', function (req, res) {
   console.log("Got a GET request for /table");
   res.render('table');
});

app.get('/overview', function (req, res) {
   console.log("Got a GET request for /overview");
   res.render('overview');
});

app.get('/attackmap', function(req, res, next) {
  console.log("Got a GET request for /attackmap");
  res.render('attackmappage');
});

app.get('/ipstats', function(req, res, next) {
  console.log("Got a GET request for /ipstats");
  connection.query("SELECT i.input, DATE_FORMAT(i.timestamp, '%d %b %Y %T') as timestamp "
                  + "FROM input i "
                  + "JOIN sessions s on s.id = i.session "
                  + "WHERE s.ip = '" + req.query.ip + "'"
                  + "order by timestamp desc;", function(err, result) {

                      if(err){
                          throw err;
                      } else {
                          res.render('ipstats', {data: result});
                      }
                  });
});

app.get('/geochart', function(req, res, next) {
  console.log("Got a GET request for /geochart");
  res.render('geochartpage');
});

app.get('/attackers', function(req, res, next) {
  console.log("Got a GET request for /attackers");
  res.render('attackerspage');

});

app.use(function(req, res) {
  res.type('text/html');
  res.status(404);
  res.render('404');
});

app.use(function(err, req, res, next) {
  console.error(err.stack);
  res.status(500);
  res.render('500');
});


app.listen(app.get('port'), function () {

  console.log("Example app listening at http://localhost:" + app.get('port'));

});

new CronJob('0 */10 * * * *', function() {
  console.log('Running 10 minutely cron job...');
  sql.updateAllJson();
  sql.updateIPTable();
}, null, true);
