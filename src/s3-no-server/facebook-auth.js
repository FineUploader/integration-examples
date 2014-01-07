$(function() {
    var scriptId = "facebook-jssdk",
        refScript = document.getElementsByTagName("script")[0],
        autoLogout = true,
        sdkScript;

    if (!document.getElementById(scriptId)) {
        sdkScript = document.createElement("script");
        sdkScript.id = scriptId;
        sdkScript.async = true;
        sdkScript.src = "//connect.facebook.net/en_US/all.js";

        refScript.parentNode.insertBefore(sdkScript, refScript);
    }

    window.fbAsyncInit = function() {
        FB.init({
            appId      : "494966370620626",
            status     : true,
            cookie     : false,
            xfbml      : false
        });

        $("#facebook-signin").click(function() {
            autoLogout = false;
            FB.login();
        });

        FB.Event.subscribe('auth.authResponseChange', function(response) {
            if (response.status === 'connected') {
                if (autoLogout) {
                    FB.api("/me/permissions", "DELETE");
                }
                else {
                    (function() {
                        var expiresInMs = parseInt(response.authResponse.expiresIn) * 1000;
                        $(document).trigger("tokenReceived.s3Demo");

                        FB.api("/me", function(response) {
                            s3DemoGlobals.userName = response.name;
                        });

                        s3DemoGlobals.assumeRoleWithWebIdentity({
                            idToken: response.authResponse.accessToken,
                            roleArn: "arn:aws:iam::776099607611:role/demo-s3-noserver-facebook",
                            providerId: "graph.facebook.com"
                        });

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

    $(document).on("tokenExpired.s3Demo", function() {
        $("#facebook-signin").show();
    });
    $(document).on("tokenReceived.s3Demo", function() {
        $("#facebook-signin").hide();
    });
});
