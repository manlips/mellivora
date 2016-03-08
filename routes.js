var database = require("./mysqltest.js");
var renderer = require("./renderer.js");

var commonHeader = { 'Content-Type': 'text/html'};
var plainHeader = { 'Content-Type': 'text/plain'}


//Handle HTTP route GET / and POST / i.e. Home
function home(request, response) {
  //if url === "/" && GET
  if(request.url === "/") {
    //show search
    response.writeHead(200, commonHeader);
    renderer.view("header", {}, response);
    renderer.view("testpage", {}, response);
    renderer.view("footer", {}, response);
    response.end();
  }
}

function stats(request, response) {
  if(request.url === "/stats") {
    response.writeHead(200, plainHeader);
    renderer.view("header", {}, response);
    database.queryToTable('SELECT sessions.ip, auth.username, auth.password, auth.timestamp, auth.success '
                                  + 'FROM auth '
                                  + 'INNER JOIN sessions '
                                  + 'ON auth.session = sessions.id '
                                  + 'LIMIT 5;');
      //renderer.view("testpage", values, response);

  }
}

module.exports.home = home;
module.exports.stats = stats;
