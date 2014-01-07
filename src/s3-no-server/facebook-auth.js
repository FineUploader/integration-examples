/**
 * Handles the Facebook login workflow.
 */
$(function() {
    var scriptId = "facebook-jssdk",
        refScript = document.getElementsByTagName("script")[0],
        autoLogout = true,
        sdkScript;

    // Sets up the script tag used to load the SDK
    if (!document.getElementById(scriptId)) {
        sdkScript = document.createElement("script");
        sdkScript.id = scriptId;
        sdkScript.async = true;
        sdkScript.src = "//connect.facebook.net/en_US/all.js";

        refScript.parentNode.insertBefore(sdkScript, refScript);
    }

    // Called when the SDK is loaded and ready
    window.fbAsyncInit = function() {
        // Initialize the login workflow
        FB.init({
            appId      : "494966370620626",
            status     : true,
            cookie     : false,
            xfbml      : false
        });

        // Called when the login button is clicked
        $("#facebook-signin").click(function() {
            // Ensure we don't de-auth the user if they click on the login button
            autoLogout = false;
            FB.login();
        });

        // Called when auth attempt has completed
        FB.Event.subscribe('auth.authResponseChange', function(response) {
            // Successfully authenticated
            if (response.status === 'connected') {
                // Force FB to delete auth credentials for the user on page load.
                // This ensure the user has to re-authenticate on page load.  Probably only useful for this demo.
                if (autoLogout) {
                    FB.api("/me/permissions", "DELETE");
                }
                else {
                    (function() {
                        var expiresInMs = parseInt(response.authResponse.expiresIn) * 1000;
                        $(document).trigger("tokenReceived.s3Demo");

                        // Grab the authenticated user's name via the Graph API (for file storage)
                        FB.api("/me", function(response) {
                            s3DemoGlobals.userName = response.name;
                        });

                        // Grab S3 credentials for the user
                        s3DemoGlobals.assumeRoleWithWebIdentity({
                            idToken: response.authResponse.accessToken,
                            roleArn: "arn:aws:iam::776099607611:role/demo-s3-noserver-facebook",
                            providerId: "graph.facebook.com"
                        });

                        // Ensure the user is asked to re-auth just before the token expires
                        setTimeout(function() {
                            alert("Token expired. You must sign in again.");
                            $(document).trigger("tokenExpired.s3Demo");
                        }, expiresInMs - 10000)
                    }());
                }
            }
            else {
                $(document).trigger("tokenExpired.s3Demo");
            }
        });
    };

    // Show the login button if we don't have a valid token to use
    $(document).on("tokenExpired.s3Demo", function() {
        $("#facebook-signin").show();
    });

    // Hide the login button if we do have a valid token to use
    $(document).on("tokenReceived.s3Demo", function() {
        $("#facebook-signin").hide();
    });
});
