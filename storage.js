/**
 * Creates the local storage.
 * @return {goog.storage.Storage} the local storage.
 */
function getStorage() {
    var mechanism = new goog.storage.mechanism.HTML5LocalStorage();
    var localStorage = new goog.storage.Storage(mechanism);
    return localStorage;
}

/**
 * Computes the expiration of the access token, then saves the access token.
 * @param {string} token contains the value of the access token.
 * @param {string} expires_in the validity of the token in seconds.
 */
function saveToken(token, expires_in) {
    var now = new goog.date.DateTime().getTime();
    var accessToken = {};
    var msToAdd = (parseInt(expires_in) - 100) * 1000;
    accessToken.expiration = now + msToAdd;
    accessToken.access_token = token;
    var localStorage = getStorage();
    localStorage.set('accessToken', accessToken);
}
