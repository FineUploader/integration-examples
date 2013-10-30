var express = require("express"),
    fs = require("fs"),
    rimraf = require("rimraf"),
    app = express(),
    fileInputName = "qqfile",
    assetsPath = __dirname + "/assets/",
    placeholdersPath = assetsPath + "placeholders/",
    uploadedFilesPath = assetsPath + "uploadedFiles/",
    chunkDirName = "chunks",
    maxFileSize = 10000000;

app.use(express.static(__dirname));
app.use("/fineuploader", express.static(assetsPath));
app.use("/placeholders", express.static(placeholdersPath));
app.use("/uploads", express.static(uploadedFilesPath));
app.use(express.bodyParser());
app.listen(8000);

app.post("/uploads", handleUploadFileRequest);
app.delete("/uploads/:uuid", handleDeleteFileRequest);


function handleUploadFileRequest(req, res) {
    res.set("Content-Type", "text/plain");

    if (req.body.qqpartindex == null) {
        handleSimpleUploadRequest(req, res);
    }
    else {
        handleChunkedUploadRequest(req, res);
    }
}

function handleSimpleUploadRequest(req, res) {
    var file = req.files[fileInputName],
        uuid = req.body.qquuid,
        sendThumbnailUrl = req.body.sendThumbnailUrl == "true",
        responseData = {
            success: false
        };

    file.name = req.body.qqfilename;

    if (isValid(file)) {
        moveUploadedFile(file, uuid, function() {
            responseData.success = true;

            if (sendThumbnailUrl) {
                responseData.thumbnailUrl = "/uploads/" + uuid + "/" + file.name;
            }

            res.send(responseData);
        },
        function() {
            responseData.error = "Problem copying the file!";
            res.send(responseData);
        });
    }
    else {
        responseData.error = "Too big!";
        res.send(responseData);
    }
}

function handleChunkedUploadRequest(req, res) {
    //TODO
}

function handleDeleteFileRequest(req, res) {
    var uuid = req.params.uuid,
        dirToDelete = uploadedFilesPath + uuid;

    rimraf(dirToDelete, function(error) {
        if (error) {
            console.error("Problem deleting file! " + error);
            res.status(500);
        }

        res.send();
    });
}

function isValid(file) {
    return file.size < maxFileSize;
}

function moveUploadedFile(file, uuid, success, failure) {
    var destinationDir = uploadedFilesPath + uuid,
        fileDestination = destinationDir + "/" + file.name;

    fs.mkdir(destinationDir, function(error) {
        var sourceStream, destStream;

        if (error) {
            console.error("Problem creating directory " + destinationDir + ": " + error);
            failure();
        }
        else {
            sourceStream = fs.createReadStream(file.path);
            destStream = fs.createWriteStream(fileDestination);

            sourceStream
                .on("error", function(error) {
                    console.error("Problem copying file: " + error.stack);
                    failure();
                })
                .on("end", success)
                .pipe(destStream);
        }
    });
}
