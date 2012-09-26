var SMALL_TIMER = 12;

(function() {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame =
            window[vendors[x]+'CancelAnimationFrame'] || window[vendors[x]+'CancelRequestAnimationFrame'];
    }

    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() { callback(currTime + timeToCall); },
              timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };

    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
}());

//http://stackoverflow.com/a/728694/820262
function clone(obj) {
    // Handle the 3 simple types, and null or undefined
    if (null == obj || "object" != typeof obj) return obj;

    var copy;
    // Handle Date
    if (obj instanceof Date) {
        copy = new Date();
        copy.setTime(obj.getTime());
        return copy;
    }

    // Handle Array
    if (obj instanceof Array) {
        copy = [];
        var len = obj.length;
        for (var i = 0; i < len; ++i) {
            copy[i] = clone(obj[i]);
        }
        return copy;
    }

    // Handle Object
    if (obj instanceof Object) {
        copy = {};
        for (var attr in obj) {
            if (obj.hasOwnProperty(attr)) copy[attr] = clone(obj[attr]);
        }
        return copy;
    }

    throw new Error("Unable to copy obj! Its type isn't supported.");
}

function throttle(f, ms) {

    var timer;
    var state = null;

    var COOLDOWN = 1;
    var CALL_SCHEDULED = 2;

    var scheduledThis, scheduledArgs;

    function later() {
        if (state == COOLDOWN) {
            state = null;
            return;
        }

        if (state == CALL_SCHEDULED) {
            state = null;
            wrapper();
        }
    }

    function wrapper() {
        f.apply(scheduledThis, scheduledArgs);
    }

    return function() {
        scheduledThis = this;
        scheduledArgs = arguments;

        state == COOLDOWN && (state = CALL_SCHEDULED);

        if (state)
            return;

        wrapper();

        state = COOLDOWN;
        timer = setTimeout(later, ms);
    }
}