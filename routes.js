var database = require("./mysqltest.js");


//Handle HTTP route GET / and POST / i.e. Home
function home(request, response) {
  //if url === "/" && GET
  if(request.url === "/") {
    //show search
    response.writeHead(200, { 'Content-Type': 'text/plain' });
    response.write("Header\n");
    response.write("Info\n");
    response.end('Footer\n');
  }
  //if url === "/" && POST
    //redirect to /:username
}

function data(request, response) {

  if(request.url === "/data") {
    //show search
    var queryResults;
    response.writeHead(200, { 'Content-Type': 'text/plain' });
    response.write("This is the data page!\n\n");
    database.query('SELECT sessions.ip, auth.username, auth.password, auth.timestamp, auth.success '
                  + 'FROM auth '
                  + 'INNER JOIN sessions '
                  + 'ON auth.session = sessions.id '
                  + 'LIMIT 10', request, response);

  }
}

module.exports.home = home;
module.exports.data = data;
