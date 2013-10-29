var express = require("express"),
    fs = require("fs"),
    app = express(),
    fileInputName = "qqfile",
    maxFileSize = 10000000;

app.use(express.static(__dirname));
app.use("/fineuploader", express.static(__dirname + "/assets"));
app.use("/placeholders", express.static(__dirname + "/assets/placeholders"));
app.use("/uploads", express.static(__dirname + "/assets/uploadedFiles"));
app.use(express.bodyParser());
app.listen(8000);

app.post("/uploads", function(req, res) {
    var file = req.files[fileInputName],
        sendThumbnailUrl = req.body.sendThumbnailUrl == "true",
        fileDestination = __dirname + "/assets/uploadedFiles/" + file.name,
        source = fs.createReadStream(file.path),
        dest = fs.createWriteStream(fileDestination),
        responseData = {
            success: false
        };

    res.set("Content-Type", "text/plain");

    if (file.size < maxFileSize) {
        responseData.success = true;

        source
            .pipe(dest)

            .on("end", function() {
                if (sendThumbnailUrl) {
                    responseData.thumbnailUrl = "/uploads/" + file.name;
                }

                res.send(responseData);
            })

            .on("error", function(error) {
                console.log("Problem copying file: " + error.stack);
                responseData.error = "Problem copying the file!";
                res.send(responseData);
            });
    }
    else {
        responseData.error = "Too big!";
        res.send(responseData);
    }
});
