var routes = require("./routes.js");

var http = require('http')
var port = process.env.PORT || 1337;

http.createServer( function (request, response) {
  routes.home(request, response);
  routes.data(request, response);
}).listen(port);

console.log("Server Running...")
