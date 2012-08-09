function refreshAccessToken() {
    function run() {
        return run._at = run._at || getStorage().get('accessToken');
    }
    run._at = false;
    return run;
}

window.accessToken = refreshAccessToken();
/**
 * If a fragment is present sends a validation request for the token, otherwise
 * redirects to the authorization server.
 */
function authorize(callback) {
    var uri = new goog.Uri(window.location);
    if (uri.hasFragment()) {
        var queryData = new goog.Uri.QueryData(uri.getFragment());
        window.location.hash = "";
        sendValidationRequest(queryData.get('access_token'), callback);
    } else {
        redirectToAuth();
    }
}

/**
 * Redirects to the authorization server.
 */
function redirectToAuth() {
    var authUri = new goog.Uri(conf.AUTH_URI);
    authUri.setParameterValue('scope', conf.AUTH_SCOPE);
    authUri.setParameterValue('redirect_uri', conf.REDIRECT_URI);
    authUri.setParameterValue('response_type', 'token');
    authUri.setParameterValue('client_id', conf.CLIENT_ID);
    window.location = authUri.toString();
}

/**
 * Requests information about the received token using JSONP, then calls
 * processValidationResponse to validate the token.
 * @param {string} accessToken the value of the access token to validate.
 */
function sendValidationRequest(accessToken, callback) {
    var reqUri = new goog.Uri(conf.TOKEN_INFO_URI);
    reqUri.setParameterValue('access_token', accessToken);
    var jsonp = new goog.net.Jsonp(reqUri);
    jsonp.send({}, function(response) {
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
