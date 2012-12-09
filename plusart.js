/**
 * User: ArtZub
 * Date: 21.09.12
 * Time: 13:56
 */

    /** minimal size of node */
var MIN_SIZE_NODE = 1,
    /** minimal link degree of node */
    MIN_LD_NODE = 0;

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
            setTimeout(arguments.callee, time || 1);

    }, time || 1);
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

function incSize(item) {
    item.linkDegree = item.linkDegree || MIN_LD_NODE;
    item.r = item.r || MIN_SIZE_NODE;
    item.linkDegree++;
    item.r++;
}



function decSize(item) {
    item.linkDegree--;
    item.linkDegree = item.linkDegree < MIN_LD_NODE ? MIN_LD_NODE : item.linkDegree;
    item.r--;
    item.r = item.r < MIN_SIZE_NODE ? MIN_SIZE_NODE : item.r;
}


