function refreshAccessToken() {
    function run() {
        return getStorage().get('accessToken');
    }
    run._at = false;
    return run;
}

function checkAuth(callback, errorcall) {
    gapi.auth.authorize({
            client_id: conf.CLIENT_ID,
            scope: conf.AUTH_SCOPE,
            immediate: accessToken() && accessToken().expiration > Date.now()
        },
        function handleAuthResult(authResult) {
            if (authResult && !authResult.error) {
                saveToken(authResult.access_token, authResult.expires_in);
                callback && callback(authResult);
            } else {
                console.log("some error " + (authResult || ""));
                getStorage().removeItem("accessToken");
                if(errorcall) {
                    errorcall(authResult || {error : "error auth"});
                }
                else {
                    setTimeout((function(callback) {
                        return function() {
                            checkAuth(callback, function(error) {
                                window.alert('Error in process auth.\n' + error);
                            });
                        };
                    })(callback), 1);
                }
            }
        });
}

window.accessToken = refreshAccessToken();


/**
 * If a fragment is present sends a validation request for the token, otherwise
 * redirects to the authorization server.
 */
function authorize(callback) {
    if (!!window.location.hash) {
        var queryData = decodeURIComponent(window.location.hash).replace(/.*access_token=(.*?)&.*/i, "$1");
        window.location.hash = "";
        sendValidationRequest(queryData, callback);
    } else {
        redirectToAuth();
    }
}

/**
 * Redirects to the authorization server.
 */
function redirectToAuth() {
    var authUri = conf.AUTH_URI + "?" +
    [ 'scope=' + conf.AUTH_SCOPE,
      'redirect_uri=' + conf.REDIRECT_URI,
      'response_type=token',
      'client_id=' + conf.CLIENT_ID ].join("&");
    window.location = authUri;
}

/**
 * Requests information about the received token using JSONP, then calls
 * processValidationResponse to validate the token.
 * @param {string} accessToken the value of the access token to validate.
 */
function sendValidationRequest(accessToken, callback) {
    JSONP(conf.TOKEN_INFO_URI + "?" + 'access_token=' + accessToken, function(response) {
        processValidationResponse(response, accessToken, callback);
    });
}

/**
 * Discards the token and redirects to the authorization server if is invalid,
 * otherwise invokes sendRequest passing the valid access token.
 * @param {object} response the response of tokeninfo.
 * @param {string} accessToken the value of the access token to validate.
 */
function processValidationResponse(response, accessToken, callback) {
    if (response.error == 'Invalid token' || response.audience != conf.CLIENT_ID) {
        redirectToAuth();
    } else {
        saveToken(accessToken, response.expires_in);
        window.accessToken = refreshAccessToken();
        callback && callback(accessToken);
    }
}
