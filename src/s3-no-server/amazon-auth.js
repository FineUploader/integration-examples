/**
 * Handles the Amazon login workflow.
 */
$(function() {
        // Called when the SDK is loaded & ready
    var onAmazonLoginReady = function() {
            amazon.Login.setClientId("amzn1.application-oa2-client.86174d2cae1d4fe9950b7f31f4d1e3aa");
        },

        sdkScriptEl = document.createElement('script');

    // Prepare the script tag used to load the SDK
    sdkScriptEl.type = "text/javascript";
    sdkScriptEl.async = true;
    sdkScriptEl.id = "amazon-login-sdk";
    sdkScriptEl.src = "https://api-cdn.amazon.com/sdk/login1.js";
    document.getElementById("amazon-root").appendChild(sdkScriptEl);

    // Called when the login button is clicked
    document.getElementById("amazon-signin").onclick = function() {
        // Only allow access to profile, and always require re-auth
        var options = {
            scope : "profile",
            interactive: "always"
        };

        // Attempt to authorize the user (results in pop-up)
        amazon.Login.authorize(options)
            // Called when the auth attempt has completed
            .onComplete(function(authResult) {
                // If authorized...
                if (authResult.status === "complete") {
                    var expiresInMs = parseInt(authResult.expires_in) * 1000;

                    $(document).trigger("tokenReceived.s3Demo");

                    // Get the authenticated user's name (for file storage)
                    amazon.Login.retrieveProfile(function(response) {
                        s3DemoGlobals.userName = response.profile.Name;
                    });

                    // Grab S3 credentials using the bearer token
                    s3DemoGlobals.assumeRoleWithWebIdentity({
                        idToken: authResult.access_token,
                        roleArn: "arn:aws:iam::776099607611:role/demo-s3-noserver-amazon",
                        providerId: "www.amazon.com"
                    });

                    // Make the user re-auth just before the token expires.
                    setTimeout(function() {
                        alert("Token expired. You must sign in again.");
                        $(document).trigger("tokenExpired.s3Demo");
                    }, expiresInMs - 10000)
                }
            });
        return false;
    };

    window.onAmazonLoginReady = onAmazonLoginReady;

    // Show the login button if there is no usable token
    $(document).on("tokenExpired.s3Demo", function() {
        $("#amazon-signin").show();
    });

    // Hide the login button if a usable token exists
    $(document).on("tokenReceived.s3Demo", function() {
        $("#amazon-signin").hide();
    });

});
