/**
 * Sets up a Fine Uploader S3 jQuery instance, ensures files are saved under a "directory" in the bucket
 * bearing the logged-in user's name, provides a link to view the uploaded file after it has reached the bucket,
 * asks the user to re-login before the token has expired, and asks AWS for new credentials before those expire.
 */
$(function() {
    var bucketUrl = "https://fineuploader-s3-client-demo-uploads.s3.amazonaws.com",
        updateCredentials = function(error, data) {
            if (!error) {
                $('#uploader').fineUploaderS3("setCredentials", s3DemoGlobals.getFuCredentials(data));
            }
        },
        hideUploader = function() {
            $("#uploader").hide();
        };

    $("#uploader").fineUploaderS3({
        debug: true,
        request: {
            endpoint: bucketUrl
        },
        objectProperties: {
            acl: "public-read",
            key: function(id) {
                var filename = this.getName(id),
                    uuid = this.getUuid(id);

                return qq.format("{}/{}.{}", s3DemoGlobals.userName.replace("/\s/g", "_"), uuid, qq.getExtension(filename));
            }
        },
        chunking: {
            enabled: true
        },
        resume: {
            enabled: true
        },
        validation: {
            itemLimit: 5,
            sizeLimit: 15000000
        },
        thumbnails: {
            placeholders: {
                notAvailablePath: "not_available-generic.png",
                waitingPath: "waiting-generic.png"
            }
        }
    })
        .on('complete', function(event, id, name, response, xhr) {
            var $fileEl = $(this).fineUploaderS3("getItemByFileId", id),
                $viewBtn = $fileEl.find(".view-btn"),
                key = $(this).fineUploaderS3("getKey", id);

            if (response.success) {
                $viewBtn.show();
                $viewBtn.attr("href", bucketUrl + "/" + key);
            }
        })
        .on("credentialsExpired", function() {
            var promise = new qq.Promise();

            assumeRoleWithWebIdentity({
                callback: function(error, data) {
                    if (error) {
                        promise.failure("Failed to assume role");
                    }
                    else {
                        promise.success(s3DemoGlobals.getFuCredentials(data));
                    }
                }
            });

            return promise;
        });

    s3DemoGlobals.updateCredentials = updateCredentials;

    $(document).on("tokenExpired.s3Demo", hideUploader);
    $(document).on("tokenReceived.s3Demo", function() {
        $("#uploader").show();
    });
    $(document).trigger("tokenExpired.s3Demo");
});
