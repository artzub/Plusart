/**
 * Uses JSONP to send a request to the API.
 * @param {string} accessToken the value of the access token used to authorize
 *    the request.
 */
function sendRequest(accessToken, url, callback) {
    url += url.indexOf("?") === -1 ? "?" : "&";
    url += plusart.useKey ? "key=" + conf.API_KEY : 'access_token=' + accessToken;
    JSONP(url, callback);
}