$(function() {
    var assumeRoleWithWebIdentity = function(callback) {
        var sts = new AWS.STS();

        callback = callback || s3DemoGlobals.updateCredentials;

        sts.assumeRoleWithWebIdentity({
            RoleArn: "arn:aws:iam::776099607611:role/demo-s3-clientside-signing",
            RoleSessionName: "web-identity-federation",
            WebIdentityToken: s3DemoGlobals.idToken
        }, callback);
    };

    s3DemoGlobals.assumeRoleWithWebIdentity = assumeRoleWithWebIdentity;
}());
