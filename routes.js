


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
    response.writeHead(200, { 'Content-Type': 'text/plain' });
    response.write("Header\n");
    response.write("This is the data page!\n");
    response.end('Footer\n');
  }
}

module.exports.home = home;
module.exports.data = data;
