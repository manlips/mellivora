var mysql = require("mysql");

// First you need to create a connection to the db
var connection = mysql.createConnection({
  host: "52.77.31.251",
  user: "bees",
  password: "AnTrackt0R",
  database: "bighive"
});

connection.connect(function(err){
  if(err){
    console.log('Error connecting to Db');
    return;
  }
  console.log('Connection established');
});

connection.query('SELECT sessions.ip, auth.username, auth.password, auth.timestamp, auth.success FROM auth INNER JOIN sessions ON auth.session = sessions.id LIMIT 5',function(err,rows){
  if(err) throw err;

  console.log('Data received from Db:\n');
  console.log(rows);
});

connection.end(function(err) {
  // The connection is terminated gracefully
  // Ensures all previously enqueued queries are still
  // before sending a COM_QUIT packet to the MySQL server.
});
