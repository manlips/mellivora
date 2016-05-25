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
    console.log('*DBConnect*: Error connecting to Db: ' + error.stack);
    //Error: Cannot enqueue Handshake after invoking quit.
    return;
  }
  console.log('*DBConnect*: Connection to DB established with ID: ' + connection.threadId);
});

function updateAuthJson() {
  connection.query( 'SELECT sessions.ip, auth.username, auth.password, auth.timestamp '
                                  + 'FROM auth '
                                  + 'INNER JOIN sessions '
                                  + 'ON auth.session = sessions.id '
                                  + 'ORDER BY auth.timestamp ASC;',
                                  function(error, result) {
    if(error){
      console.error('Error on updateAuthJson: ' + error);
      return;
    }
    //console.log(result);
    fs.writeFile(__dirname + "/bigjson/authtable.json", JSON.stringify(result), function(err) {
      if(err) {
        return console.log(err);
      }
      console.log("authtable.json has been created/updated! :)")
    })
  });
};

function updateJson(filename, sqlQuery) {
  connection.query(sqlQuery, function(error, result) {
    if(error){
    console.error('*updateJson*: Error on updateJson(' + filename + ') select query: ' + error);
    return;
    }
    fs.writeFile(__dirname + "/public/json/" + filename + ".json", JSON.stringify(result), function(err) {
    if(err) {
    return console.log('*updateJson*: Error on updateJson(' + filename + ') file write: ' + error);
    }
    console.log("*updateJson*: " + filename + ".json has been created/updated! :)")
    })
  })
}

function updateIPTable() {
  //console.log("******** Updating IP Table with new IP Information ********\n");
  console.log("*updateIPTable*: Checking for new IPs...")
  connection.query( 'SELECT DISTINCT sessions.ip '
                  + 'FROM sessions '
                  + 'LEFT OUTER JOIN ip '
                  + 'ON sessions.ip = ip.ip '
                  + 'WHERE ip.ip IS NULL '
                  + 'UNION '
                  + 'SELECT DISTINCT sensors.public_ip FROM sensors '
                  + 'LEFT OUTER JOIN ip ON sensors.public_ip = ip.ip '
                  + 'WHERE ip.ip IS NULL;',
                   function(error, result) {
    if(error){
      console.error('*updateIPTable* Error: ' + error);
      return;
    } else if(result.length === 0) {
      console.log('*updateIPTable*: IP table is already up to date :) Nothing to do here...');
      return;
    }
    //console.log(JSON.stringify(result));
    var numIPs = 0; //number of IPs found
    var ipnums= [];
    //console.log("*updateIPTable*: New IPs Found!");
    result.forEach( function(arrayItem) {
      var currentIpNum = 0;

      var individualNums = arrayItem.ip.split('.');

      currentIpNum += individualNums[0] * 16777216;
      currentIpNum += individualNums[1] * 65536;
      currentIpNum += individualNums[2] * 256;
      currentIpNum += parseInt(individualNums[3]);
      arrayItem.ipnum = currentIpNum;
      numIPs += 1;
      console.log("*updateIPTable*: IP Found: " + arrayItem.ip + " | Setting IPNum to: " + currentIpNum);
    })
    console.log("*updateIPTable*: " + numIPs + " new IPs found :D");
    var sql = []
    result.forEach(function(arrayItem) {
      sql.push({"ip": arrayItem.ip, "query": 'SELECT country_code, country_name, region_name, city_name, latitude, longitude ' +
                'FROM ip2location_db5 ' +
                'WHERE ip_from <= ' + arrayItem.ipnum + ' AND ' + arrayItem.ipnum + ' <= ip_to;'});
    });
    console.log("*updateIPTable*: Running select queries...");
    curNum = 0;
    sql.forEach(function(arrayItem) {
      connection.query(arrayItem.query, function(error, result) {
        curNum += 1;
        if(error) {
          console.error('*updateIPTable*: ------ Error on selecting IP: ' + error + " (IP " + curNum + " of " + numIPs + ") ------");
          return
        }
        console.log("*updateIPTable*: Lookup of " + arrayItem.ip + " Successful | Country: " + result[0].country_name + " (IP " + curNum + " of " + numIPs + ")");
        result[0].ip = arrayItem.ip;
        //console.log(result);
        var ipdata = result;
        connection.query("INSERT INTO ip (ip, country_code, country_name, region_name, city_name, latitude, longitude)" +
                          "VALUES ('" + ipdata[0].ip + "','" + ipdata[0].country_code + "','" + mysql_real_escape_string(ipdata[0].country_name) + "','" + mysql_real_escape_string(ipdata[0].region_name) + "','" + mysql_real_escape_string(ipdata[0].city_name) + "','" + ipdata[0].latitude + "','" + ipdata[0].longitude + "');",
                        function(error, result) {
                          if(error) {
                            console.error('*updateIPTable*: ------ Error on Inserting IP Details: ' + error + " (IP " + curNum + " of " + numIPs + ") ------");
                            return
                          }
                          console.log("*updateIPTable*: Successfully Inserted: " + ipdata[0].ip + " | Server Status: " + result.serverStatus + " | Affected Rows: " + result.affectedRows  + " (IP " + curNum + " of " + numIPs + ")");
                          //console.log(result);
                        });
      });
    });
  });
};

function updateAllJson() {
  updateJson("totalauthbyday", "SELECT DATE_FORMAT(timestamp, '%Y-%m-%d') as date, COUNT(timestamp) as count "
                        + 'FROM auth '
                        + 'GROUP BY DATE(timestamp);');

  updateJson("locations", 'SELECT sessions.ip, COUNT(sessions.ip) as count, ip.latitude, ip.longitude, ip.country_name, ip.region_name, ip.city_name '
                        + 'FROM auth '
                        + 'INNER JOIN sessions '
                        + 'ON auth.session = sessions.id '
                        + 'JOIN ip '
                        + 'ON sessions.ip = ip.ip '
                        + 'GROUP BY sessions.ip '
                        + 'ORDER BY count DESC '
                        + 'LIMIT 400;');

  updateJson("totalauthbyhour", "SELECT concat(DATE(timestamp),' ', HOUR(timestamp), ':00:00') as date, count(timestamp) as count "
          + "FROM auth "
          + "GROUP BY date(timestamp), HOUR(timestamp)");

  updateJson("authcountcountry", "SELECT ip.country_name, count(ip.country_name) as count "
                              + "FROM auth "
                              + "INNER JOIN sessions "
                              + "ON auth.session = sessions.id "
                              + "JOIN ip "
                              + "ON sessions.ip = ip.ip "
                              + "GROUP BY ip.country_name ");

  updateJson("topuserstoday", "SELECT username, count(*) count "
  	                         + "FROM auth "
                             + "WHERE timestamp >= current_date() "
                             + "AND timestamp <= current_date() + INTERVAL 1 DAY "
                             + "GROUP BY username "
                             + "ORDER BY count DESC "
                             + "LIMIT 5");

  updateJson("toppasswordstoday", "SELECT password, count(*) count "
  	                         + "FROM auth "
                            + "WHERE timestamp >= current_date() "
                            + "AND timestamp <= current_date() + INTERVAL 1 DAY "
                            + "GROUP BY password "
                            + "ORDER BY count DESC "
                            + "LIMIT 5");

  updateJson("latestsensorhealth", "SELECT h.sensor, s.codename, s.public_ip, i.city_name as location, h.cpuavg10 as cpuload, h.totalthreads, h.diskutil, DATE_FORMAT(h.timestamp, '%d %b %T') as timestamp FROM health h "
                              + "JOIN sensors s on s.id = h.sensor "
                              + "JOIN ip i on i.ip = s.public_ip "
                              + "WHERE DATE_FORMAT(h.timestamp, '%d %b %Y %H:%i') = (SELECT DATE_FORMAT(MAX(h.timestamp), '%d %b %Y %H:%i') FROM health h)");

  updateJson("allattackers", "SELECT concat('<a href=\"/ipstats?ip=',sessions.ip,'\">', sessions.ip, '</a>') AS 'source', COUNT(sessions.ip) AS count, Date_Format(MIN(sessions.starttime), '%d %b %Y %T') AS 'first', Date_Format(MAX(sessions.starttime), '%d %b %Y %T') AS 'last', "
                            +  "CASE WHEN EXISTS(SELECT session from input where input.session = sessions.id) "
	                          +  "THEN concat('<a href=\"/ipstats?ip=',sessions.ip,'\">', 'True', '</a>') "
                            +  "ELSE 'False' "
                            +  "END AS input "
                            +  "FROM sessions, auth "
                            +  "WHERE auth.session = sessions.id "
                            +  "GROUP BY sessions.ip "
                            +  "ORDER BY COUNT(sessions.ip) desc;");

  updateJson("top10input", "SELECT input, count(*) count, Date_Format(MIN(timestamp), '%d %b %Y %T') 'first_used', Date_Format(MAX(timestamp), '%d %b %Y %T') 'last_used' "
                          + "FROM input "
                          + "GROUP BY input "
                          + "ORDER BY count DESC "
                          + "LIMIT 10;");

  updateJson("allsensorstats", "SELECT h.sensor, s.codename, s.config_link, s.host, s.ip as hostname, s.public_ip, i.country_name, i.region_name, i.city_name, i.latitude, i.longitude, h.cpuavg10 as cpuload, h.totalthreads, h.diskutil, h.rcvpkts, h.sndpkts, h.uptime, DATE_FORMAT(h.timestamp, '%d %b %Y %T') as timestamp "
                              + "FROM health h "
                              + "JOIN sensors s on s.id = h.sensor "
                              + "JOIN ip i on i.ip = s.public_ip "
                              + "WHERE DATE_FORMAT(h.timestamp, '%d %b %Y %H:%i') = (SELECT DATE_FORMAT(MAX(h.timestamp), '%d %b %Y %H:%i') FROM health h);");
}

updateIPTable();
//updateAuthJson(); //This one is a hassle but keeping here for the sake of a few functions
updateAllJson();

//REENABLE SAFE UPDATES!

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

module.exports.updateIPTable = updateIPTable;
module.exports.updateAllJson = updateAllJson;
// module.exports.queryAuth = queryAuth;
