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
    console.log('Error connecting to Db: ' + error.stack);
    //Error: Cannot enqueue Handshake after invoking quit.
    return;
  }
  console.log('Connection established with ID: ' + connection.threadId);
});

// connection.query( 'SELECT sessions.ip, auth.username, auth.password, auth.timestamp '
//                                 + 'FROM auth '
//                                 + 'INNER JOIN sessions '
//                                 + 'ON auth.session = sessions.id '
//                                 + 'ORDER BY auth.timestamp ASC;',
//                                 function(error, result) {
//     if(error){
//       console.error('Error on queryAuth: ' + error);
//       return;
//     }
//     console.log(result);
//     fs.writeFile(__dirname + "/bigjson/authtable.json", JSON.stringify(result), function(err) {
//       if(err) {
//         return console.log(err);
//       }
//       console.log("authtable.json has been created! :)")
//     })
//   });

connection.query( 'SELECT DISTINCT ip '
                  + 'FROM sessions LIMIT 5',
                   function(error, result) {
  if(error){
    console.error('Error on getIP: ' + error);
    return
  }
  console.log(JSON.stringify(result));

  var ipnums= [];

  result.forEach( function(arrayItem) {
    var currentIpNum = 0;

    var individualNums = arrayItem.ip.split('.');

    currentIpNum += individualNums[0] * 16777216;
    currentIpNum += individualNums[1] * 65536;
    currentIpNum += individualNums[2] * 256;
    currentIpNum += parseInt(individualNums[3]);
    arrayItem.ipnum = currentIpNum;
  })

  console.log(JSON.stringify(result));
  var sql = []
  result.forEach(function(arrayItem) {
    sql.push({"ip": arrayItem.ip, "query": 'SELECT country_code, country_name, region_name, city_name, latitude, longitude ' +
              'FROM ip2location_db5 ' +
              'WHERE ip_from <= ' + arrayItem.ipnum + ' AND ' + arrayItem.ipnum + ' <= ip_to;'});
  });
  console.log(sql);

  sql.forEach(function(arrayItem) {
    connection.query(arrayItem.query, function(error, result) {
      if(error) {
        console.error('Error on selecting IP: ' + error);
        return
      }
      result[0].ip = arrayItem.ip;
      console.log(result);
      var ipdata = result;
      connection.query("INSERT INTO ip (ip, country_code, country_name, region_name, city_name, latitude, longitude)" +
                        "VALUES ('" + ipdata[0].ip + "','" + ipdata[0].country_code + "','" + ipdata[0].country_name + "','" + mysql_real_escape_string(ipdata[0].region_name) + "','" + ipdata[0].city_name + "','" + ipdata[0].latitude + "','" + ipdata[0].longitude + "');",
                      function(error, result) {
                        if(error) {
                          console.error('Error on Inserting IP Details: ' + error);
                          return
                        }
                        console.log(result);
                      })
    })
  });

  console.log(sql);

});

function mysql_real_escape_string (str) {
    return str.replace(/[\0\x08\x09\x1a\n\r"'\\\%]/g, function (char) {
        switch (char) {
            case "\0":
                return "\\0";
            case "\x08":
                return "\\b";
            case "\x09":
                return "\\t";
            case "\x1a":
                return "\\z";
            case "\n":
                return "\\n";
            case "\r":
                return "\\r";
            case "\"":
            case "'":
            case "\\":
            case "%":
                return "\\"+char; // prepends a backslash to backslash, percent,
                                  // and double/single quotes
        }
    });
}

// module.exports.queryToTable = queryToTable;
// module.exports.queryAuth = queryAuth;
