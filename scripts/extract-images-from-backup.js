const fs = require("fs");
var glob = require("glob");

// options is optional
glob("./backup/**/*.mhtml", {}, function(er, files) {
  files.map(file => {
    let backupFile = fs.readFileSync(file, "utf8");
    lines = backupFile.split("\n");
    lines.map((line, index) => {
      if (isLocationLine(line)) {
        console.log(line);
        let imageName = line
          .replace(
            "http://162.243.140.100:8080/wp-content/uploads/2016/08/",
            ""
          )
          .replace("Content-Location: ", "");
        let tempLocation = lines[index + 1];
        let tempIndex = index + 1;
        let base64Image = "";
        while (!isLocationLine(tempLocation)) {
          tempLocation = lines[tempIndex];
          if (isBoundryLimit(tempLocation) || !tempLocation) {
            break;
          }
          if (tempLocation) {
            base64Image += tempLocation;
          }
          tempIndex++;
        }
        base64Image = base64Image.trim();
        fs.writeFileSync("./extracted-images/" + imageName, base64Image);
        var buf = new Buffer(base64Image, "base64");
        fs.writeFileSync("./images/" + imageName, buf);
        //add this to an html file so we can convert it to an actual image
      }
      //now read after location line till you hit another location
    });
  });
});

function isBoundryLimit(line) {
  if (line.indexOf("MultipartBoundary") !== -1) {
    return true;
  }
  return false;
}

function isLocationLine(line) {
  if (!line) {
    return false;
  }
  if (
    line.indexOf("Content-Location: ") !== -1 &&
    line.indexOf("icon-for-website") === -1
  ) {
    if (line.indexOf(".jpg") !== -1 || line.indexOf(".png") !== -1) {
      return true;
    }
  }
  return false;
}
