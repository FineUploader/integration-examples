$(function() {
    var onAmazonLoginReady = function() {
            amazon.Login.setClientId("amzn1.application-oa2-client.86174d2cae1d4fe9950b7f31f4d1e3aa");
        },
        sdkScriptEl = document.createElement('script');

    sdkScriptEl.type = "text/javascript";
    sdkScriptEl.async = true;
    sdkScriptEl.id = "amazon-login-sdk";
    sdkScriptEl.src = "//api-cdn.amazon.com/sdk/login1.js";
    document.getElementById("amazon-root").appendChild(sdkScriptEl);

    document.getElementById("amazon-signin").onclick = function() {
        options = { scope : 'profile' };
        amazon.Login.authorize(options)
            .onComplete(function(authResult) {
                if (authResult.status === "complete") {
                    var expiresInMs = parseInt(authResult.expires_in) * 1000;
                    $("#amazon-signin").hide();
                    $(document).trigger("tokenReceived.s3Demo");

                    amazon.Login.retrieveProfile(function(response) {
                        s3DemoGlobals.userName = response.profile.Name;
                    });

                    s3DemoGlobals.assumeRoleWithWebIdentity({
                        idToken: authResult.access_token,
                        roleArn: "arn:aws:iam::776099607611:role/demo-s3-noserver-amazon",
                        providerId: "www.amazon.com"
                    });

                    setTimeout(function() {
                        alert("Token expired. You must sign in again.");
                        $(document).trigger("tokenExpired.s3Demo");
                    }, expiresInMs - 10000)
                }
            });
        return false;
    };

    window.onAmazonLoginReady = onAmazonLoginReady;
    $(document).on("tokenExpired.s3Demo", function() {
        $("#amazon-signin").show();
    });
    $(document).on("tokenReceived.s3Demo", function() {
        $("#amazon-signin").hide();
    });

});
