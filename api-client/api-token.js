/**
 * Generate OAuth token
 */
exports.GetApiToken = function (config, logger) {
    var request = require('request');
    var options = {
        method: 'POST',
        uri: "https://" + config.hostname + "/oauth2/v1/token",
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        form: {
            'grant_type': 'password',
            'username': config.username + '@encompass:' + config.instanceId,
            'password': config.password,
            'client_id': config.clientId,
            'client_secret': config.clientSecret
        }
    };

    return new Promise((resolve, reject) => {
        logger.debug(">>> Creating token for " + config.username + '@encompass:' + config.instanceId);

        // Make api call to create token
        request(options, function (error, response) { 
            if (error) {
                logger.error("!!! Error while creating OAuth token for for " + config.username + '@encompass:' + config.instanceId 
                        + ": " + error);
                reject(error);
            } else if (response.statusCode != 200) {
                logger.error("!!! Call to create OAuth token failed with status code: " + response.statusCode 
                    + " Response: ", response.body);
                reject({statusCode: response.statusCode, body: response.body});
            } else {
                logger.debug("<<< Call successful with status code: " + response.statusCode);
                var data = JSON.parse(response.body);
                resolve(data.token_type + " " + data.access_token);
            }
        });

    });
};
