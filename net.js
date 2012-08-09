/**
 * Uses JSONP to send a request to the API.
 * @param {string} accessToken the value of the access token used to authorize
 *    the request.
 */
function sendRequest(accessToken, url, callback) {
  var reqUri = new goog.Uri(url);
  reqUri.setParameterValue('access_token', accessToken);
  var jsonp = new goog.net.Jsonp(reqUri);
  jsonp.send({}, callback);
}