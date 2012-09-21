var plusart = window.plusart || {};

plusart.asyncForEach = function(items, fn) {
    if (!(items instanceof Array))
        return;

    var workArr = items.concat();

    setTimeout(function() {
        if (workArr.length > 0)
            fn(workArr.pop(), workArr);
        if (workArr.length > 0)
            setTimeout(arguments.callee, 12);

    }, 12);
}

plusart.redrawInit = function(func) {
    plusart.redraw = func;
}

//http://stackoverflow.com/a/728694/820262
function clone(obj) {
    // Handle the 3 simple types, and null or undefined
    if (null == obj || "object" != typeof obj) return obj;

    // Handle Date
    if (obj instanceof Date) {
        var copy = new Date();
        copy.setTime(obj.getTime());
        return copy;
    }

    // Handle Array
    if (obj instanceof Array) {
        var copy = [];
        var len = obj.length;
        for (var i = 0; i < len; ++i) {
            copy[i] = clone(obj[i]);
        }
        return copy;
    }

    // Handle Object
    if (obj instanceof Object) {
        var copy = {};
        for (var attr in obj) {
            if (obj.hasOwnProperty(attr)) copy[attr] = clone(obj[attr]);
        }
        return copy;
    }

    throw new Error("Unable to copy obj! Its type isn't supported.");
}