var plusar = plusar || {};

plusar.asyncForEach = function(items, fn) {
    var workArr = items.concat();

    setTimeout(function() {
        if (workArr.length > 0)
            fn(workArr.pop(), workArr);
        if (workArr.length > 0)
            setTimeout(arguments.callee, 12);

    }, 12);
}

plusar.redrawInit = function(func) {
    plusar.redraw = func;
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

function d3_rgb(r, g, b, a) {
    return new d3_Rgb(r, g, b, a);
}
function d3_Rgb(r, g, b, a) {
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a;
}
function d3_rgb_hex(v) {
    return v < 16 ? "0" + Math.max(0, v).toString(16) : Math.min(255, v).toString(16);
}
function d3_rgb_parseNumber(c) {
    var f = parseFloat(c);
    return c.charAt(c.length - 1) === "%" ? Math.round(f * 2.55) : f;
}
function d3_rgb_parse(format, rgb, hsl) {
    var r = 0, g = 0, b = 0, m1, m2, name, a = 1;
    m1 = /([a-z]+)\((.*)\)/i.exec(format);
    if (m1) {
        m2 = m1[2].split(",");
        switch (m1[1]) {
            case "hsl":
            {
                return hsl(parseFloat(m2[0]), parseFloat(m2[1]) / 100, parseFloat(m2[2]) / 100);
            }
            case "rgb":
            {
                return rgb(d3_rgb_parseNumber(m2[0]), d3_rgb_parseNumber(m2[1]), d3_rgb_parseNumber(m2[2]),
                    parseFloat(typeof m2[3] != "undefined" ? m2[3] : a));
            }
        }
    }
    if (format != null && format.charAt(0) === "#") {
        if (format.length === 4) {
            r = format.charAt(1);
            r += r;
            g = format.charAt(2);
            g += g;
            b = format.charAt(3);
            b += b;
        } else if (format.length === 7) {
            r = format.substring(1, 3);
            g = format.substring(3, 5);
            b = format.substring(5, 7);
        }
        r = parseInt(r, 16);
        g = parseInt(g, 16);
        b = parseInt(b, 16);
    }
    return rgb(r, g, b, a);
}
d3.rgb = function(r, g, b, a) {
    return arguments.length === 1 ? r instanceof d3_Rgb ? d3_rgb(r.r, r.g, r.b, r.a) : d3_rgb_parse("" + r, d3_rgb, d3_rgb) : d3_rgb(~~r, ~~g, ~~b, ~~a);
};
d3_Rgb.prototype.brighter = function(k) {
    k = Math.pow(.7, arguments.length ? k : 1);
    var r = this.r, g = this.g, b = this.b, i = 30;
    if (!r && !g && !b) return d3_rgb(i, i, i);
    if (r && r < i) r = i;
    if (g && g < i) g = i;
    if (b && b < i) b = i;
    return d3_rgb(Math.min(255, Math.floor(r / k)), Math.min(255, Math.floor(g / k)), Math.min(255, Math.floor(b / k)), this.a);
};
d3_Rgb.prototype.darker = function(k) {
    k = Math.pow(.7, arguments.length ? k : 1);
    return d3_rgb(Math.floor(k * this.r), Math.floor(k * this.g), Math.floor(k * this.b), this.a);
};
d3_Rgb.prototype.alpha = function(a) {
    return d3_rgb(this.r, this.g, this.b, a ? (a > 1 ? 1 : a) : 0);
}
d3_Rgb.prototype.toString = function() {
    return this.a == 1 || typeof this.a == "undefined"
        ? "#" + d3_rgb_hex(this.r) + d3_rgb_hex(this.g) + d3_rgb_hex(this.b)
        : "rgba(" + [this.r, this.g, this.b, this.a] + ")";
};
