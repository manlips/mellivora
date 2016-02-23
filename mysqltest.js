var mysql = require("mysql");

// First you need to create a connection to the db
var connection = mysql.createConnection({
  host: "52.77.31.251",
  user: "bees",
  password: "AnTrackt0R",
  database: "bighive"
});

function getDatabase(query, request, response) {
  connection.connect(function(error){
    if(error){
      response.end('Error connecting to Db: ' + error.stack);
      //Error: Cannot enqueue Handshake after invoking quit.
      return;
    }
    console.log('Connection established with ID: ' + connection.threadId);
  });

  connection.query(query,function(error, result){
    if(error){
      response.end('Query Error: ' + error.stack);
      return
    }

    console.log('Running Query:\n \n' + query + '\n \n');
    console.log(result);
    response.end(queryToText(result, query));
  });

  function queryToText(result) {
    var text = "Running Query: \n \n" + query + "\n \n";
    for (i = 0; i < result.length; i++) {
      for (property in result[i]) {
        text += property + ": " + result[i][property] + " | ";
      }
      text += "\n";
    }

    return text;
  }

  connection.end(function(error) {
    // The connection is terminated gracefully
    // Ensures all previously enqueued queries are still
    // before sending a COM_QUIT packet to the MySQL server.
  });
}

module.exports.query = getDatabase;
