/**
 * Parse plus and append in node
 * @param {DOMElement} node — host dom element
 * @return {Function}
 */
function parsePluses(node) {
    return function(pluses) {
        var ul = goog.dom.createElement('ul');
        for (var plus in pluses.items) {
            plus = pluses.items[plus];
            var li = goog.dom.createElement('li');
            goog.dom.append(lip, goog.dom.createTextNode(plus.displayName));
            goog.dom.append(ul, lip);
        }
        goog.dom.append(node, ul);
    }
}

function parseUserActivity(node) {
    return function(activities) {
        var ul = goog.dom.createElement('ul');
        for (var i in activities.items) {
            i = activities.items[i];
            var li = goog.dom.createElement('li');
            goog.dom.append(li, goog.dom.createTextNode(i.id + ' : ' + i.title));
            goog.dom.append(ul, li);
            if (i.object.plusoners.totalItems > 0)
                sendRequest(accessToken().access_token,
                    i.object.plusoners.selfLink,
                    parsePluses(li));
        }
        goog.dom.append(node, ul);
    }
}