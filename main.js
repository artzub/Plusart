/**
 * User: ArtZub
 * Date: 27.09.12
 * Time: 14:12
 */

"use strict";
var params = {};

function parseParams(hash) {
    params = {};
    hash.replace(/^#/, "").split("&").forEach(function(item) {
        var values = item.toLowerCase().split("=");
        var key = values[0];
        params[key] = values.length > 1 ? values[1] : "";
    });

    var gid = (params.gids ? params.gids : null ) || data.me.id;

    plusart.Count = parseInt(params.count || plusart.Count || 10, redix);
    plusart.Depth = parseInt(params.depth || plusart.Depth || 1, redix);

    plusart.maxResults.replies = parseInt(params["ccount"] || plusart.maxResults.replies || 10, redix);
    plusart.maxResults.plusoners = parseInt(params["ppcount"] || plusart.maxResults.plusoners || 10, redix);
    plusart.maxResults.resharers = parseInt(params["rpcount"] || plusart.maxResults.resharers || 10, redix);

    plusart.gids = gid.split(";");
    plusart.useRandom = plusart.Depth < 2 && plusart.gids.length < 2;
    plusart.gids.indexOf("me") > -1 && (plusart.gids[plusart.gids.indexOf("me")] = data.me.id);

    plusart.friction = parseFloat(params.friction || .9);
    plusart.gravity = parseFloat(params.gravity || .05);
    plusart.charge = parseFloat(params.charge || 10);
    plusart.theta = parseFloat(params.theta || .8);
    plusart.linkDistance = parseFloat(params.linkDistance || 1.2);
    plusart.linkStrength = parseFloat(params.linkStrength || 1.2);

    plusart.shownode = typeof params.shownode != "undefined" ? (params.shownode == '' ? true : params.shownode) : true;
    plusart.showedge = typeof params.showedge != "undefined" ? (params.showedge == '' ? true : params.showedge) : false;

    plusart.isInit = typeof params.reset != "undefined" ? false : plusart.isInit;
}

d3.select(window).on("hashchange", function() {
    d3.event.preventDefault();
    parseParams(document.location.hash);

    if (plusart.isInit) {
        plusart.asyncForEach(plusart.gids, function(id) {
            if (typeof data.hash[id] == "undefined") {
                data.hash[id] = -1;
                parseUserActivity(data, id, plusart.Count, plusart.Depth);
            }
        });
    }
    else
        if (forceGraph)
            forceGraph.restart();
});

window.data &&
    data.links.forEach(function(d) {
        d.sourceNode = data.nodes[d.source];
        d.targetNode = data.nodes[d.target];
    });

window.data = window.data || {
    hash : {},
    nodes : [],
    links : []
};

data.getIdByIndex = function(i) {
    var d;
    return i > -1 && data.nodes.length > i && (d = this.nodes[i]) ? (d.nodeValue.hasOwnProperty("actor")
        ? d.nodeValue.actor
        : d.nodeValue
    ).id : null;
};

data.getSelected = function() {
    return data.selected > -1 && data.nodes.length > data.selected
        ? data.nodes[data.selected]
        : null;
};

data.hash = data.hash || {};

var w = 0,
    h = 0,
    renderTimer,
    calcTimer,
    dgraphTimer,
    autostop;

var vis;
var alpha = d3.scale.ordinal();

function callAlpha(d) {
    if (d) {
        var arr = alpha.domain().concat(
                [d.date = (d.type == 0 && d.dates.length && d3.max(d.dates)) || d.date]);
        var i = .5 / (arr.length || 1); //1;
        alpha.range(d3.range(.1, .5, i));
        alpha.domain(
            arr.sort(d3.ascending)
        );
    }
}

var radiuses = function(d) {return d};

function collide(node) {
    var r = node.r * 1.2 + 16,
        nx1 = node.x - r,
        nx2 = node.x + r,
        ny1 = node.y - r,
        ny2 = node.y + r;
    return function(quad, x1, y1, x2, y2) {
        if (node.visible && quad.point && (quad.point !== node)) {
            var x = node.x - quad.point.x,
                y = node.y - quad.point.y,
                l = Math.sqrt(x * x + y * y),
                r = (node.r + quad.point.r) * 1.2;
            if (l < r) {
                l = (l - r) / l * .5;
                x *= l;
                y *= l;
                if (!node.fixed) {
                    node.x -= x;
                    node.y -= y;
                }
                if (!quad.point.fixed) {
                    quad.point.x += x;
                    quad.point.y += y;
                }
            }
        }
        return x1 > nx2
            || x2 < nx1
            || y1 > ny2
            || y2 < ny1;
    };
}

var forceGraph = d3.layout.force()
    .nodes(data.nodes)
    .links(data.links)
    //.size([w, h])
    .friction(.9)
    .gravity(.05)
    .charge(function(d) {
        return -(d.r * 10);
    })
    .theta(.8)
    .linkDistance(function(d) {
        var dx = d.target.r,
            dy = d.source.r,
            dr = dx + dy;
        return dr * 1.2;
    })
    .linkStrength(1.2)
    .on("tick.redraw", function() {
        if (vis)
            vis.update();

        var nodes = forceGraph.nodes(),
            q = d3.geom.quadtree(nodes),
            i = nodes.length
            ;

        while (--i > -1)
            q.visit(collide(nodes[i]));
    })
    .on("end", function() {
        calcTimer = true;
        d3.select("span#calcTimer").each(clickButton);
    })
    .on("start", function() {
        calcTimer = undefined;
        d3.select("span#calcTimer").each(clickButton);
    })
    ;

forceGraph.restart = function() {
    if (calcTimer || autostop) {
        this.resume();
        calcTimer = undefined;
        d3.select("span#calcTimer").each(clickButton);
    }
    else {
        vis.update();
    }
};

plusart.redrawInit(function(d) {
    forceGraph.start();
    if (d)
        callAlpha(d);
    /*if (vis)
        vis.render();*/
});

function resize() {
    w = d3.max([
            //document.body.scrollWidth,
            //document.body.offsetWidth,
            document.body.clientWidth,
            window.innerWidth
            //document.documentElement.clientWidth,
            //document.documentElement.scrollWidth,
            //document.documentElement.offsetWidth
    ]);
    h = d3.max([
            //document.body.scrollHeight,
            //document.body.offsetHeight,
            document.body.clientHeight,
            window.innerHeight
            //document.documentElement.clientHeight,
            //document.documentElement.scrollHeight,
            //document.documentElement.offsetHeight
    ]) - 5;

    //forceGraph && forceGraph.size([w, h]);
}

function startFlow() {
    resize();

    var colors = d3.scale.ordinal().range([
        d3.rgb("#29BD1C"),
        d3.rgb("#FFFE1A"),
        d3.rgb("#2C87FF"),
        d3.rgb("#FEA61D"),
        d3.rgb("#FF3F46")
    ]).domain([0, 4]);

    vis = {
        transform : {
            translate : [w/2, h/2],
            scale : 1
        },
        checkVisible : function (d, offsetx, offsety) {
            resize();
            var tf = this.transform,
                tx = tf.translate[0]/tf.scale,
                ty = tf.translate[1]/tf.scale
                ;
            d.visible = d.visible != undefined ? d.visible : true;

            offsetx = offsetx || 0;
            if (!(offsetx instanceof Array))
                offsetx = [offsetx, offsetx];
            offsety = offsety || 0;
            if (!(offsety instanceof Array))
                offsety = [offsety, offsety];

            return d.visible && (
                    d.x + d.r > -tx + offsetx[0]
                 && d.x - d.r < -tx + offsetx[1] + w/tf.scale
                 && d.y + d.r > -ty + offsety[0]
                 && d.y - d.r < -ty + offsety[1] + h/tf.scale
            );
        },
        renderEdge : function() {
            if (plusart.showedge) {
                var context = this.canvas;

                if (!context)
                    return;

                //plusart.asyncForEach(
                        forceGraph.links().forEach(function (d) {

                    var c = fill(1, d.source);
                    context.strokeStyle = "rgba(" + [c.r, c.g, c.b, fill_opacity(1, d.source)] + ")";

                    //context.strokeStyle = colors(d.source.type).toString();
                    context.lineWidth = 1;//linew(1, d.target);

                    var xs = d.source.x,
                        ys = d.source.y,
                        xt = d.target.x,
                        yt = d.target.y;

                    if (vis.checkVisible(d.source) || vis.checkVisible(d.target)) {
                        context.beginPath();
                        context.moveTo(xs, ys);
                        var x3 = .3 * yt - .3 * ys + .8 * xs + .2 * xt,
                            y3 = .8 * ys + .2 * yt - .3 * xt + .3 * xs,
                            x4 = .3 * yt - .3 * ys + .2 * xs + .8 * xt,
                            y4 = .2 * ys + .8 * yt - .3 * xt + .3 * xs;
                        context.bezierCurveTo(x3, y3, x4, y4, xt, yt);
                        context.stroke();
                    }
                });
            }
        },
        renderNode : function() {
            if (typeof plusart.shownode != "undefined") {
                var context = this.canvas;

                if (!context)
                    return;

                var nodes = forceGraph.nodes(),
                    i = nodes.length,
                    d,
                    c
                    ;

                while(--i > -1) {
                    d = nodes[i];
                    if (vis.checkVisible(d)) {
                        if (plusart.showshadow || d.clicked) {
                            context.beginPath();
                            c = fill(0, d);
                            //c = !d.overed ? c : c;//brighter().brighter().brighter();
                            context.fillStyle = "rgba(" + [c.r, c.g, c.b, d.clicked ? .4 : .15] + ")";
                            context.strokeStyle = "none";
                            context.lineWidth = 0;
                            context.arc(d.x + (d.clicked ? 0 : d.r * .2), d.y + (d.clicked ? 0 : d.r * .2), radius(1, d) + (d.clicked ? d.r * (!d.overed ? .15 : .35) : 0), 0, PI_CIRCLE, true);
                            context.fill();
                            context.stroke();
                        }
                        for(var ind = 1; ind > -1; --ind) {
                            context.beginPath();
                            c = fill(ind, d);
                            context.fillStyle = "rgba(" + [c.r, c.g, c.b, fill_opacity(ind, d)] + ")";
                            context.strokeStyle = ind ? stroke(ind, d).toString() : "none";
                            context.lineWidth = linew(ind, d);
                            context.arc(d.x, d.y, radius(ind, d) + (!d.overed ? 0 : radius(ind, d) * 0.2), 0, PI_CIRCLE, true);
                            context.fill();
                            context.stroke();
                        }
                    }
                }
            }
        },
        update : function() {
            //vis.zoom();
            vis.valide = false;
        },
        render : function() {
            this.renderEdge();
            this.renderNode();
        },
        zoom : function() {
            if (this.canvas) {
                this.canvas.clearRect(0, 0, w, h);

                this.canvas.save();

                if (vis.event && !vis.dragOn) {
                    if (vis.event.hasOwnProperty("translate"))
                        this.transform.translate = vis.event.translate.slice(0);
                    if (vis.event.hasOwnProperty("scale"))
                        this.transform.scale = vis.event.scale;
                    vis.event = undefined;
                }

                this.canvas.translate(this.transform.translate[0], this.transform.translate[1]);
                this.canvas.scale(this.transform.scale, this.transform.scale);

                this.render();
                this.canvas.restore();
            }
        },
        contain : function(d, pos) {
            var px = (this.transform.translate[0] - pos[0]) / this.transform.scale,
                py = (this.transform.translate[1] - pos[1]) / this.transform.scale,
                r = Math.sqrt( Math.pow( d.x + px , 2) +
                        Math.pow( d.y + py , 2 ) );

            return r < d.r;
        },
        getNodeFromPos : function(pos) {
            for (var i = data.nodes.length - 1; i >= 0; i--) {
                var d = data.nodes[i];
                if (d.visible && this.contain(d, pos))
                    return d;
            }
            return null;
        }
    };

    function zoom() {
        if (!vis.dragOn
            && d3.event
            && d3.event.type
            && d3.event.type == "zoom")
            vis.event = d3.event;
        forceGraph.restart();
    }

    var zoomBehavior = d3.behavior.zoom()
        .translate(vis.transform.translate)
        .scale(vis.transform.scale)
        .scaleExtent([.001, 100])
        .on("zoom", zoom);

    function resizeWindow() {
        return function() {
            resize();

            d3.select(vis.canvas.canvas)
                .attr("width", w)
                .attr("height", h);

            vis.canvas.canvas.width = w;
            vis.canvas.canvas.height = h;

            zoom();
        }
    }

    var tooltip = d3.select("#tooltip"),
        tippanel = d3.select("#tippanel"),
        tp_content = d3.select("#tippanel-content");


    function showToolTip(d) {
        if (!d) {
            tooltip.style("display", "none");
            return;
        }
        if (tooltip.style("display") == "none") {

            var actor = d.nodeValue ? (d.nodeValue.hasOwnProperty("actor") ? d.nodeValue.actor : d.nodeValue) : {url : "#", id : "", displayName : "undefined"},
                post = d.nodeValue && d.nodeValue.kind && d.nodeValue.kind == "plus#activity" ? d.nodeValue : undefined;

            tooltip.selectAll("*").remove();
            var cont = [
                '<div class="post">',
                    getHeader(actor, post ? post.url : actor.url, d.date),
                    getContent(post),
                    getAttachments(post),
                    getStatistic(post),
                '</div>'
            ].join('');

            /*switch (d.type) {
                case 3:
                case 0:
                    cont += "<span>"
                          + title(d)
                          + "</span>";
                    break;
                case 2:
                case 1:
                    cont = d.nodeValue.object.content;
                    break;
            }
            cont += "";*/
            tooltip.html(cont);
            tooltip.style("display", "block");
            tooltip.selectAll("a").attr("target", "_blank");
            tooltip.classed('fixed', false);
            if (vis.fixedItem == d)
                tooltip.classed('fixed', true);
        }
    }

    function moveToolTip(d, event) {
        if (d) {
            tooltip
                .style("top", event.pageY > h * 3 / 4 ? (event.pageY - tooltip.node().clientHeight - 3) + "px" : (event.pageY + 3) + "px")
                .style("left", event.pageX > w * 3 / 4 ? (event.pageX - tooltip.node().clientWidth - 3) + "px" : (event.pageX + 3) + "px")
                ;
        }
    }

    var resizeTimer;
    d3.select(window).on("onresize", function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(resizeWindow(), 100);
    });

    function movemc(d) {
        var item = arguments.length > 1 && arguments[1] instanceof HTMLCanvasElement ? arguments[1] : this;
        delete vis["click"];
        if (!vis.dragOn) {
            d = null;
            if (data.hasOwnProperty("selected")) {
                var od = data.getSelected();
                if (vis.contain(od, d3.mouse(item)))
                    d = od;
                if (!d) {
                    od && (od.fixed &= 3);
                    delete data["selected"];
                    d3.select("body").style("cursor", "default");
                }
            }
            else
                d = vis.getNodeFromPos(d3.mouse(item));

            if (d) {
                data.selected = d.index;
                d.fixed |= 4;
                d3.select("body").style("cursor", "pointer");
                forceGraph.restart();
            }
            tooltip
                .on("mousemove.tooltip", null)
                .classed("op30", false);
            showToolTip(d, d3.event);
        }
        else {
            d = data.getSelected();
            if (d) {
                d.px = (d3.event.pageX - vis.transform.translate[0]) / vis.transform.scale;
                d.py = (d3.event.pageY - vis.transform.translate[1]) / vis.transform.scale;
                if (!calcTimer) {
                    d.x = d.px;
                    d.y = d.py;
                }
                tooltip
                    .on("mousemove.tooltip", function() {
                        d = data.getSelected();
                        if (d) {
                            d.px = (d3.event.pageX - vis.transform.translate[0]) / vis.transform.scale;
                            d.py = (d3.event.pageY - vis.transform.translate[1]) / vis.transform.scale;
                            if (!calcTimer) {
                                d.x = d.px;
                                d.y = d.py;
                            }
                            forceGraph.restart();
                        }
                    })
                    .classed("op30", true);
                forceGraph.restart();
            }
        }
        moveToolTip(d, d3.event);
        if (!calcTimer && !autostop)
            forceGraph.restart();
    }

    function getRealPos(d) {
        return {
            pageX:d.x * vis.transform.scale + vis.transform.translate[0],
            pageY:d.y * vis.transform.scale + vis.transform.translate[1]
        };
    }

    function addItemToTipPanel(item) {
        if(tp_content.selectAll("#postid-" + item.nodeValue.id.replace('.', '_')).empty())
            tp_content.append("div")
                .attr("id", "postid-" + item.nodeValue.id.replace('.', '_'))
                .attr("class", "userinfo")
                .style("opacity", "0")
                .call(function(div) {
                    var value = item.nodeValue,
                        actor = value.actor || value;

                    div.datum(item);

                    div.append("img")
                        .style("pointer-events", "none")
                        .attr("src", actor.image.url);
                    div.append("div")
                        .style("pointer-events", "none")
                        .attr("class", "data")
                        .call(function(ddiv) {
                            ddiv.append("strong").text(actor.displayName);
                            if (value.title || (item.type == 2 && value.object.content)) {
                                ddiv.append("br");
                                ddiv.append("small").text(item.type != 2 ? value.title : ddiv.append("div").style("display", "none").attr("id", "temp-for-one").html(value.object.content).text());
                                ddiv.select("#temp-for-one").remove();
                                ddiv.append("br");
                                ddiv.append("div").html(getStatistic(value));
                            }
                        });

                    div.on("click", function(d) {
                        var item = d3.select(this);
                        var tg = !item.classed('opposite');
                        tp_content.selectAll('.userinfo').classed('opposite', false);
                        item.classed('opposite', tg);
                        vis.fixedItem = false;
                        if (tg) {
                            vis.fixedItem = d;
                        }
                    });

                    div.on("mouseover", function(d){
                        if (tp_content.focusTimer)
                            clearTimeout(tp_content.focusTimer);
                        tp_content.focusTimer = setTimeout((function(d) {
                            return function() {
                                if (!d.overed) {
                                    d.overed = true;
                                    var cord = getRealPos(d);

                                    if (d.visible && !vis.checkVisible(d, [tp_content.node().clientWidth, 0])) {
                                        vis.transform.translate = [
                                            (w/* + tp_content.node().clientWidth*/)/2 - cord.pageX + vis.transform.translate[0],
                                            h/2 - cord.pageY + vis.transform.translate[1]
                                        ];
                                        zoomBehavior.translate(vis.transform.translate);
                                        cord = getRealPos(d);
                                    }

                                    showToolTip(d);
                                    moveToolTip(d, cord);
                                    tooltip.style("opacity", 1);
                                    forceGraph.restart();
                                }
                            }
                        })(d), 150);
                    });

                    function deover(d) {
                        if (tp_content.focusTimer)
                            clearTimeout(tp_content.focusTimer);
                        delete d['overed'];
                        tooltip.style("opacity", null);
                        showToolTip(null);
                    }

                    div.on("mouseout", function(d){
                        deover(d);
                        forceGraph.restart();
                    });

                    div.append("div")
                        .attr("class", "lo")
                        .on("click", (function(d) {
                            return function () {
                                d.fixed &= 1;
                                d.clicked = !d.clicked;
                                deover(d);
                                removeItemFromTipPanel(d);
                                forceGraph.restart();
                            }
                        })(item));
                })
                .transition()
                .duration(500)
                .style("opacity", "1");
        return true;
    }

    function removeItemFromTipPanel(item) {
        if (vis.fixedItem == item)
            vis.fixedItem = false;
        delete item['overed'];
        tp_content.selectAll("#postid-" + item.nodeValue.id.replace('.', '_'))
            .transition()
            .duration(500)
            .style("opacity", "0")
            .remove();
        return false;
    }

    vis.canvas = d3.select("body")
            .append("canvas")
            .text("Your browser does not have support for Canvas.")
            .call(zoomBehavior)
            .on("mousedown.canvas", function(d) {
                (d = data.getSelected())
                && (vis.dragOn = true)
                && (d3.select("body").style("cursor", "move"))
                && (vis.click = true)
                && (d.fixed |= 2);
            })
            .on("mouseup.canvas", function(d) {
                vis.dragOn = false;
                (d = data.getSelected())
                && (zoomBehavior.translate(vis.transform.translate)
                    .scale(vis.transform.scale))
                && !((!vis.click && d.clicked) || (vis.click && ((d.clicked = !d.clicked) ? addItemToTipPanel(d) : removeItemFromTipPanel(d))))
                && !(d.fixed &= 1) && movemc(null, vis.canvas.canvas);
            })
            .on("mousemove.canvas", movemc)
            .node().getContext("2d");

    resizeWindow()();

    function fill(i, d) {
        var bc = isChecked(d) ? colors(d.type) : (data.selected > -1 ? d3.rgb("#666") : colors(d.type));
        return i ? bc
                 : colors(d.type)/*.darker().darker()*/.darker().darker();
    }

    function fill_opacity(i, d) {
        return i ? (isChecked(d) || (d.type != 1 && plusart.gids.indexOf(d.nodeValue.id) > -1) ? .8 : alpha(d.date)) : 1;
    }

    function isChecked(d) {
        return d.clicked
                || d.index == data.selected
                || (
                d.type != 1
                        && data.selected > -1
                        && (
                        d.nodeValue.hasOwnProperty("actor")
                                ? d.nodeValue.actor
                                : d.nodeValue
                        ).id == data.getIdByIndex(data.selected)
                );
    }

    function linew(i, d) {
        var r = radiuses(d.r);
        return i
               ? r
               * (
                    isChecked(d)
                    ? 0.06
                    : 0.02
                 )
               : 0;
    }

    function stroke(i, d) {
        return !isChecked(d) ? "#666" : colors(d.type)/*.darker().darker()*/.darker().darker();
    }

    function title(d) {
        return d.type == 1 || d.type == 2 ? d.nodeValue.title :
            (d.nodeValue.hasOwnProperty("actor") ? d.nodeValue.actor : d.nodeValue).displayName;
    }

    function radius(i, d) {
        var r = radiuses(d.r);
        return (i ? r : r * 0.1);
    }

    function firstRequest() {
        parseParams(document.location.hash);

        plusart.asyncForEach(plusart.gids, function(id) {
            if (typeof data.hash[id] == "undefined") {
                data.hash[id] = -1;
                parseUserActivity(data, id, plusart.Count, plusart.Depth);
            }
        });

        plusart.isInit = true;
    }

    firstRequest();
    run_renderTimer();
    run_calcTimer();
}

function closeInterval(timer) {
    if (timer == "dgraphTimer"){
        remakeSim();
        window[timer] = undefined;
    }
    else if (timer == "renderTimer") {
        clearTimeout(window[timer]);
        window[timer] = undefined;
    }
    else if (window[timer]) {
        clearInterval(window[timer]);
        window[timer] = undefined;
        if (timer == "calcTimer") {
            autostop = typeof autostop == "undefined" || autostop;
            if (forceGraph.alpha() > 0) {
                autostop = false;
                forceGraph.stop();
            }
        }
    }
}

function run_renderTimer() {
    closeInterval("renderTimer");
    renderTimer = true;
    (function animloop(){
        if (renderTimer)
            requestAnimationFrame(animloop);
        if (!vis.valide) {
            vis.zoom();
            vis.valide = true;
        }
    })();
}

function run_calcTimer() {
    closeInterval("calcTimer");
    autostop = calcTimer = true;
    forceGraph.start();
}

function remakeSim() {

}

function remakeLink(parent, old_parent, prop, decRevers) {
    prop = prop || "target";
    forceGraph.links().filter(function(d) {
        return d[prop + "Index"] == old_parent.index;
    }).forEach(function(d) {
        var item = d[prop == "target" ? "source" : "target"],
            id = (item.nodeValue.hasOwnProperty("actor") ? item.nodeValue.actor : item.nodeValue).id,
            index = data.directHash[id],
            pnt = parent;
        if (typeof index != "undefined") {
            pnt = data.nodes[index];
            var pref = prop == "target"
                    ? index + "_" + parent.index
                    : parent.index + "_" + index;
            if(!data.directHash[pref]) {
                data.directHash[pref] = -1;
                var obj = {};
                obj[prop] = obj[prop + "Node"] = parent;
                obj[prop + "Index"] = parent.index;
                obj[prop == "target" ? "source" : "target"] =
                    obj[prop == "target" ? "sourceNode" : "targetNode"] = pnt;
                obj[prop == "target" ? "sourceIndex" : "targetIndex"] = index;
                data.directHash[pref] = forceGraph.links().push(obj) - 1;
                if (calcTimer)
                    forceGraph.start();
                else
                    forceGraph.restart();
            }
            incSize(pnt);
        }
        decSize(decRevers ? item : d[prop]);
        d[prop] = d[prop + "Node"] = parent;
        d[prop + "Index"] = parent.index;
        incSize(parent);
    });
    deleteLinks(old_parent.index, prop == "source" ? "target" : "source");
}

function deleteLinks(parent, prop) {
    forceGraph.links().filter(function (d, i) {
            return d[prop + "Index"] == parent && ((d.i = i) || true);
        })
        .map(function (d) {
            decSize(d[prop == "source" ? "target" : "source"]);
            return d;
        })
        .forEach(function (d) {
            forceGraph.links().splice(d.i, 1);
            if (calcTimer)
                forceGraph.start();
            else
                forceGraph.restart();
        });
}

function removeNode(item) {
    item.visible = false;
}

function toDirectGraph() {
    data.directHash = {};

    plusart.asyncForEach(
    data.nodes.slice(0)
            .sort(function(a, b) {
                return d3.ascending(a.date, b.date);
            })
            .sort(function(a, b) {
                return d3.ascending(a.type, b.type);
    }), function(item) {
        var id = (item.nodeValue.hasOwnProperty("actor") ? item.nodeValue.actor : item.nodeValue).id;
        var index = data.directHash[id];
        if (typeof index == "undefined") {
            index = item.index;
            data.directHash[id] = index;
            item.linkDegree = 0;
            item.r = 6;
        }
        var parent = data.nodes[index];

        if (item.type == 1) {
            remakeLink(parent, item);
            removeNode(item);
        } else if (parent.index != item.index) {
            item.r = 4;
            item.linkDegree = 0;

            remakeLink(parent, item, "source", true);
            removeNode(item);
        }
    });

}

function run_dgraphTimer() {
    closeInterval(dgraphTimer);
    dgraphTimer = true;
    toDirectGraph();
}

function handleClientLoad() {
    gapi.client.setApiKey(conf.API_KEY);
    window.setTimeout(function() {
        (plusart.useKey && makeApiCall()) || checkAuth(makeApiCall);
    }, 1);
}

function clickButton(d) {
    if (window[d + "Timer"]) {
        closeInterval(d + "Timer");
        d3.select(this).classed("paused", true)
                .text("►");
    }
    else {
        if (window["run_" + d + "Timer"]) {
            window["run_" + d + "Timer"]();
            d3.select(this).classed("paused", false)
                .text("■");
        }
    }
}

// Load the API and make an API call.  Display the results on the screen.
function makeApiCall() {
    gapi.client.load('plus', 'v1', function() {
        var request = gapi.client.plus.people.get({
            'userId': 'me'
        });
        request.execute(function(resp) {
            data.me = resp;

            d3.select("#userinfo")
                .append("div")
                .attr("class", "userinfo")
                .call(function(div) {
                    div.append("img")
                        .attr("src", resp.image.url);
                    /*div.append("ul")
                        .call(function(ul) {
                            ul.append("li")
                                .append("span")
                                .append("a")
                                .attr("href", resp.url)
                                .attr("target", "blank")
                                .text(resp.displayName);
                            ul.append("li").append("a")
                                .attr("href", "javascript: void(0)")
                                .text("logout");
                        })*/
                    div.append("div")
                        .attr("class", "data")
                        .text(resp.displayName);
                    div.append("div")
                        .attr("class", "lo")
                        .on("click", function() {
                            plusart.Storage.removeItem("accessToken");
                            d3.select(this.parentNode)
                                .transition()
                                .duration(500)
                                .style("display", "none");

                        });
                });

            d3.select("#menu")
                .call(function(div) {
                    div.selectAll(".trButton")
                        .data(["calc", "render", "dgraph"])
                        .enter()
                        .append("span")
                            .attr("class", "trButton")
                            .text(String)
                            .append("span")
                            .attr("class", function(d) { return d == "dgraph" ? "paused" : ""})
                            .text(function() { return d3.select(this).classed("paused") ? "►" : "■"; })
                            .attr("id", function(d) {
                                return d + "Timer";
                            })
                            .on("click", clickButton);
                });
            d3.select("#tippanel").style("display", "block");
            d3.select("#lpbtn").on("click", function(item) {
                item = d3.select(this.parentNode);
                if (item.classed("open"))
                    item.classed("open", false);
                else
                    item.classed("open", true);
            });
            startFlow();
        });
    });
}


