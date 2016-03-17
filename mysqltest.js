var mysql = require("mysql");
var renderer = require("./renderer.js");
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
    console.log('Error connecting to Db: ' + error.stack);
    //Error: Cannot enqueue Handshake after invoking quit.
    return;
  }
  console.log('Connection established with ID: ' + connection.threadId);
});

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
    console.log(result);

    // var tableHTML = "";
    // tableHTML += '<table border="1">';
    // for (i = 0; i < result.length; i++) {
    //   tableHTML += '<tr>';
    //   tableHTML += '<td>' + result[i].ip + '</td>';
    //   tableHTML += '<td>' + result[i].username + '</td>';
    //   tableHTML += '<td>' + result[i].password + '</td>';
    //   tableHTML += '<td>' + result[i].timestamp + '</td>';
    //   tableHTML += '<td>' + result[i].success + '</td>';
    //   tableHTML += '</tr>';
    // }
    // tableHTML += '</table>'
    // console.log(tableHTML);

    fs.writeFile(__dirname + "/public/json/authtable.JSON", JSON.stringify(result), function(err) {
      if(err) {
        return console.log(err);
      }
      console.log("authtable.JSON has been created! :)")
    })
  });

// function queryToTable(query) {
//   var table = "";
//   connection.query(query,function(error, rows, fields){
//     if(error){
//       console.error(error);
//       return;
//     }
//
//     console.log('Running Query:\n \n' + query + '\n \n');
//     console.log(rows);
//     createQueryTable(rows, );
//   });
//
// }
//
// function createQueryTable(rows, callback) {
//   var tableHTML = "";
//   tableHTML += '<table border="1">';
//   for (i = 0; i < rows.length; i++) {
//     tableHTML += '<tr>';
//     tableHTML += '<td>' + rows[i].ip + '</td>';
//     tableHTML += '<td>' + rows[i].username + '</td>';
//     tableHTML += '<td>' + rows[i].password + '</td>';
//     tableHTML += '<td>' + rows[i].timestamp + '</td>';
//     tableHTML += '<td>' + rows[i].success + '</td>';
//     tableHTML += '</tr>';
//   }
//   tableHTML += '</table>'
//   return tableHTML;
// }
//
//
// module.exports.queryToTable = queryToTable;
// module.exports.queryAuth = queryAuth;
