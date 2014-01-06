$(function() {
    var plusOnScriptEl = document.createElement('script'),
        referenceScriptEl = document.getElementsByTagName('script')[0],
        s3GoogleOauthHandler = function(authResult) {
            if (authResult.status.signed_in) {
                var expiresInMs = parseInt(authResult.expires_in) * 1000;

                $("#google-signin").hide();
                $(document).trigger("tokenReceived.s3Demo");

                s3DemoGlobals.idToken = authResult.id_token;
                setUserName(authResult.access_token);
                s3DemoGlobals.assumeRoleWithWebIdentity();

                setTimeout(function() {
                    alert("Token expired. You must sign in again.");
                    $(document).trigger("tokenExpired.s3Demo");
                }, expiresInMs)
            }
            else {
                $(document).trigger("tokenExpired.s3Demo");
            }
        },
        showButton = function() {
            $("#google-signin").show();
        },
        setUserName = function(accessToken) {
            var xhr = new XMLHttpRequest();

            xhr.onload = function() {
                if (xhr.status === 200) {
                    var userName = JSON.parse(xhr.responseText).displayName;

                    s3DemoGlobals.userName = userName;
                }
            };

            xhr.open("GET", "https://www.googleapis.com/plus/v1/people/me?access_token=" + accessToken);
            xhr.send();
        },
        getFuCredentials = function(data) {
            return {
                accessKey: data.Credentials.AccessKeyId,
                secretKey: data.Credentials.SecretAccessKey,
                sessionToken: data.Credentials.SessionToken,
                expiration: data.Credentials.Expiration
            };
        };

    window.s3GoogleOauthHandler = s3GoogleOauthHandler;
    s3DemoGlobals.getFuCredentials = getFuCredentials;

    plusOnScriptEl.type = "text/javascript";
    plusOnScriptEl.async = true;
    plusOnScriptEl.src = "https://plus.google.com/js/client:plusone.js";
    referenceScriptEl.parentNode.insertBefore(plusOnScriptEl, referenceScriptEl);

    $(document).on("tokenExpired.s3Demo", showButton);
});
