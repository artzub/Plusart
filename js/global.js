var SMALL_TIMER = 12,
    PI_CIRCLE = Math.PI * 2,
    dateFormat = d3.time.format("%b %d,%Y %X"),
    redix = 10;

/** from stackoverflow http://stackoverflow.com/a/4663129/820262 */
var CP = window.CanvasRenderingContext2D && CanvasRenderingContext2D.prototype;
if (CP && CP.lineTo) {
    /*CP.customLine = function(x, y, x2, y2, da) {
        if (!da) da = [10,5];
        this.save();
        var dx = (x2-x), dy = (y2-y);
        var len = Math.sqrt(dx*dx + dy*dy);
        var rot = Math.atan2(dy, dx);
        this.translate(x, y);
        this.moveTo(0, 0);
        this.rotate(rot);
        var dc = da.length;
        var di = 0, draw = true;
        x = 0;
        while (len > x) {
            x += da[di++ % dc];
            if (x > len) x = len;
            draw ? this.lineTo(x, 0): this.moveTo(x, 0);
            draw = !draw;
        }
        this.restore();
    }*/

    CanvasRenderingContext2D.prototype.customLine = function(x, y, x2, y2, dashArray) {
        if(! dashArray) dashArray=[10,5];
        var dashCount = dashArray.length;
        var dx = (x2 - x);
        var dy = (y2 - y);
        var xSlope = (Math.abs(dx) > Math.abs(dy));
        var slope = (xSlope) ? dy / dx : dx / dy;

        this.moveTo(x, y);
        var distRemaining = Math.sqrt(dx * dx + dy * dy);
        var dashIndex = 0;
        while(distRemaining >= 0.1){
            var dashLength = Math.min(distRemaining, dashArray[dashIndex % dashCount]);
            var step = Math.sqrt(dashLength * dashLength / (1 + slope * slope));
            if(xSlope){
                if(dx < 0) step = -step;
                x += step;
                y += slope * step;
            }else{
                if(dy < 0) step = -step;
                x += slope * step;
                y += step;
            }
            this[(dashIndex % 2 == 0) ? 'lineTo' : 'moveTo'](x, y);
            distRemaining -= dashLength;
            dashIndex++;
        }
    };

    CanvasRenderingContext2D.prototype.dottedLine = function(x, y, x2, y2) {
        var size = this.lineWidth;
        this.customLine(x, y, x2, y2, [0.1, size * 3]);
    };

    CanvasRenderingContext2D.prototype.dashedLine = function(x, y, x2, y2) {
        var size = this.lineWidth + 3;
        this.customLine(x, y, x2, y2, [size, size * 3]);
    };

    CanvasRenderingContext2D.prototype.solidLine = function(x, y, x2, y2) {
        this.moveTo(x, y);
        this.lineTo(x2, y2);
    };
}

if (CP && CP.bezierCurveTo) {
    CanvasRenderingContext2D.prototype.bizierLine = function(x, y, x2, y2) {
        this.moveTo(x, y);
        var x3 = .3 * y2 - .3 * y + .8 * x + .2 * x2,
            y3 = .8 * y + .2 * y2 - .3 * x2 + .3 * x,
            x4 = .3 * y2 - .3 * y + .2 * x + .8 * x2,
            y4 = .2 * y + .8 * y2 - .3 * x2 + .3 * x;
        this.bezierCurveTo(x3, y3, x4, y4, x2, y2);
    };
}

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