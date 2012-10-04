/**
 * User: ArtZub
 * Date: 21.09.12
 * Time: 13:56
 */

window.plusart = window.plusart || {};

plusart.Count = 10;
plusart.Depth = 1;
plusart.useKey = false;
plusart.useRandom = true;
plusart.maxResults = { replies : 10, plusoners : 10, resharers : 10 };

plusart.asyncForEach = function(items, fn, time) {
    if (!(items instanceof Array))
        return;

    var workArr = items.concat();

    setTimeout(function() {
        if (workArr.length > 0)
            fn(workArr.shift(), workArr);
        if (workArr.length > 0)
            setTimeout(arguments.callee, time || 4);

    }, time || 4);
};

plusart.redrawInit = function (func) {
    plusart.redraw = func;
};

plusart.Storage = (function Storage(webstorage) {
    webstorage.__proto__.get = function(key) {
        return JSON.parse(this.getItem(key));
    };
    webstorage.__proto__.set = function(key, value) {
        this.setItem(key, JSON.stringify(value));
    };
    return webstorage;
})(window.localStorage);


