function getStorage() {
    return plusart.Storage;
}

/**
 * Computes the expiration of the access token, then saves the access token.
 * @param {string} token contains the value of the access token.
 * @param {string} expires_in the validity of the token in seconds.
 */
function saveToken(token, expires_in) {
    var now = Date.now();
    var accessToken = {};
    var msToAdd = (parseInt(expires_in) - 100) * 1000;
    accessToken.expiration = now + msToAdd;
    accessToken.access_token = token;
    var localStorage = getStorage();
    localStorage.set('accessToken', accessToken);
}
