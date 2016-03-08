var mysql = require("mysql");
var renderer = require("./renderer.js");

// First you need to create a connection to the db
var connection = mysql.createConnection({
  host: "52.77.31.251",
  user: "bees",
  password: "AnTrackt0R",
  database: "bighive"
});

connection.connect(function(error){
  if(error){
    response.end('Error connecting to Db: ' + error.stack);
    //Error: Cannot enqueue Handshake after invoking quit.
    return;
  }
  console.log('Connection established with ID: ' + connection.threadId);
});

function queryAuth() {
  connection.query( 'SELECT sessions.ip, auth.username, auth.password, auth.timestamp, auth.success '
                                + 'FROM auth '
                                + 'INNER JOIN sessions '
                                + 'ON auth.session = sessions.id '
                                + 'LIMIT 5',
                                function(error, result) {
    if(error){
      console.error('Error on queryAuth: ' + error);
      return;
    }
    console.error(result);
    return result;
  })
};

function queryToTable(query) {
  var table = "";
  connection.query(query,function(error, rows, fields){
    if(error){
      console.error(error);
      return;
    }

    console.log('Running Query:\n \n' + query + '\n \n');
    console.log(rows);
    return createQueryTable(rows);
  });

}

function createQueryTable(rows) {
  var tableHTML = "";
  tableHTML += '<table border="1">';
  for (i = 0; i < rows.length; i++) {
    tableHTML += '<tr>';
    tableHTML += '<td>' + rows[i].ip + '</td>';
    tableHTML += '<td>' + rows[i].username + '</td>';
    tableHTML += '<td>' + rows[i].password + '</td>';
    tableHTML += '<td>' + rows[i].timestamp + '</td>';
    tableHTML += '<td>' + rows[i].success + '</td>';
    tableHTML += '</tr>';
  }
  tableHTML += '</table>'
  return tableHTML;
}


module.exports.queryToTable = queryToTable;
module.exports.queryAuth = queryAuth;
