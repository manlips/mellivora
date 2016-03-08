var fs = require("fs");

function mergeValues(values, content) {
  //cycle over the keys
  for(var key in values) {
    //replace all {{key}} with the values from the values object
    content = content.replace("{{" + key + "}}", values[key]);
  }
  //return merged content
  return content;

}

function view(templateName, values, response) {
  //read from the template files
  var fileContents = fs.readFileSync('./views/' + templateName + '.html', {encoding: "utf8"});
  //insert values into the content
  fileContents = mergeValues(values, fileContents);
  //write out to the response
  response.write(fileContents);
}

function viewQueryAsTable(rows) {
  //read from the template files
  var fileContents = fs.readFileSync('./views/' + templateName + '.html', {encoding: "utf8"});
  //insert values into the content
  console.log('Putting that query into a lovely table...');
  fileContents = fileContents.replace("{{queryTable}}", createQueryTable(rows));
  //write out to the response
  response.write(fileContents);
}


module.exports.view = view;
module.exports.viewQueryAsTable = viewQueryAsTable;
