/**
 * Grabs AWS credentials for an authenticated user.
 */
$(function() {
    var assumeRoleWithWebIdentity = function(params) {
            var sts = new AWS.STS(),
                assumeRoleParams = {};

            s3DemoGlobals.roleArn = params.roleArn || s3DemoGlobals.roleArn;
            s3DemoGlobals.providerId = params.providerId || s3DemoGlobals.providerId;
            s3DemoGlobals.idToken = params.idToken || s3DemoGlobals.idToken;

            assumeRoleParams = {
                RoleArn: s3DemoGlobals.roleArn,
                RoleSessionName: "web-identity-federation",
                WebIdentityToken: s3DemoGlobals.idToken
            };

            if (s3DemoGlobals.providerId) {
                assumeRoleParams.ProviderId = s3DemoGlobals.providerId;
            }

            sts.assumeRoleWithWebIdentity(assumeRoleParams, params.callback || s3DemoGlobals.updateCredentials);
        },
        getFuCredentials = function(data) {
            return {
                accessKey: data.Credentials.AccessKeyId,
                secretKey: data.Credentials.SecretAccessKey,
                sessionToken: data.Credentials.SessionToken,
                expiration: data.Credentials.Expiration
            };
        };

    s3DemoGlobals.assumeRoleWithWebIdentity = assumeRoleWithWebIdentity;
    s3DemoGlobals.getFuCredentials = getFuCredentials;
}());
