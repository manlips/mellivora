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


function drawChart() {

  var data = new google.visualization.DataTable();
  // datetime format 2016-03-15T15:02:30.000Z
  $.getJSON('json/authtable.json', function(obj) {
    var date = new Date(GetURLParameter('date')* 1000);
    var isoDate = date.toISOString().substring(0, 10);
    var timeArray = [];
    $(".page-header").text("Stats for " + isoDate);
    //I'm fucked
    obj.forEach(function(arrayItem) {
      if(timeArray.length === 0) {
        timeArray.push({"time": "melons", "count": 0});
      }else {
        var shortDate = arrayItem.timestamp.substring(0, 10);
        var roundDateTime = arrayItem.timestamp.substring(0, 14) + "00:00.000Z";
        if ((isoDate === shortDate) && (roundDateTime !== timeArray[timeArray.length - 1].time) ) {
          timeArray.push({"time": roundDateTime, "count": 1})
        } else if (isoDate === shortDate){
          timeArray[timeArray.length - 1].count += 1;
        }
      }

    })

    timeArray.shift();

    data.addColumn('datetime', 'Time');
    data.addColumn('number', 'Authentication Requests');

    timeArray.forEach( function(arrayItem) {
      document.getElementById('chart_div').innerHTML = arrayItem.time;
      data.addRow([new Date(arrayItem.time), arrayItem.count]);
    });
    var options = {
      title: 'Authentication requests for ' + isoDate,
      height: 400,
      hAxis: {
        format: 'hh:mm'
      }
    }
    var chart = new google.visualization.LineChart(document.getElementById('chart_div'));

    chart.draw(data, options);

  })


}
