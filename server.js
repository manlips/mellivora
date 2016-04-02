var express = require('express');
var app = express();

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

app.get('/dailystats', function(req, res, next) {
  console.log("Got a GET request for /dailyauth");
  res.render('dailystats');
});

app.use(function(err, req, res, next) {
  console.log("Error: " + err.message);
  next();
});

app.get('/table', function (req, res) {
   console.log("Got a GET request for /tables");
   res.render('table');
});

app.get('/overview', function (req, res) {
   console.log("Got a GET request for /overview");
   res.render('overview');
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
