var fs = require("fs");

var authtablejson;

fs.readFile('bigjson/authtable.json', 'utf8', function(err, data) {
  if (err) throw err;
  authtablejson = JSON.parse(data);
  var dateCount = [{"date": authtablejson[0].timestamp.substring(0, 10), "count": 1}];
  authtablejson.forEach( function(arrayItem) {
    var shortDate = arrayItem.timestamp.substring(0, 10); //original date format is 2016-03-15T15:02:30.000Z
    if (shortDate !== dateCount[dateCount.length - 1].date) {
      dateCount.push({"date": shortDate, "count": 1});
    } else {
      dateCount[dateCount.length - 1].count += 1;
    }

  });
  console.log(dateCount);
  fs.writeFile(__dirname + "/public/json/totalauth.json", JSON.stringify(dateCount), function(err) {
    if(err) {
      return console.log(err);
    }
    console.log("totalauth.json has been created! :)")
  })
} )
