var express = require("express"),
    app = express();

app.use(express.static(__dirname));
app.use("/fineuploader", express.static(__dirname + "/assets"));
app.use("/placeholders", express.static(__dirname + "/assets/placeholders"));
app.listen(8000);
