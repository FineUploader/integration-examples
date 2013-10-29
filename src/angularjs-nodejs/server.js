var express = require("express"),
    app = express(),
    fileInputName = "qqfile",
    maxFileSize = 10000000;

app.use(express.static(__dirname));
app.use("/fineuploader", express.static(__dirname + "/assets"));
app.use("/placeholders", express.static(__dirname + "/assets/placeholders"));
app.use(express.bodyParser());
app.listen(8000);

app.post("/uploads", function(req, res) {
    var file = req.files[fileInputName],
        responseData = {
            success: false
        };

    res.set("Content-Type", "text/plain");

    if (file.size < maxFileSize) {
        responseData.success = true;
    }
    else {
        responseData.error = "Too big!";
    }

    res.send(responseData);
});
