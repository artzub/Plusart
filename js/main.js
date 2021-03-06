/**
 * User: ArtZub
 * Date: 27.09.12
 * Time: 14:12
 */

"use strict";
var params = {};

function parseParams(loc) {
    params = {};
    loc.hash.replace(/^#/, "").split("&").forEach(function(item) {
        var values = item.toLowerCase().split("=");
        var key = values[0];
        params[key] = values.length > 1 ? values[1] : "";
    });

    var cid = params.cids || "";
    plusart.cmBeginPos = parseInt(params.cmbp || 0);
    plusart.cmBeginPos = plusart.cmBeginPos < 0 ? 0 : plusart.cmBeginPos;


    var gid = params.gids || data.me.id;

    plusart.Count = parseInt(params.count || plusart.Count || 10, redix);
    plusart.Depth = parseInt(params.depth || plusart.Depth || 1, redix);

    plusart.membersCount = parseInt(params.cmcount || 10, redix);

    plusart.maxResults.replies = parseInt(params["ccount"] || plusart.maxResults.replies || 10, redix);
    plusart.maxResults.plusoners = parseInt(params["ppcount"] || plusart.maxResults.plusoners || 10, redix);
    plusart.maxResults.resharers = parseInt(params["rpcount"] || plusart.maxResults.resharers || 10, redix);

    plusart.cids = cid == "" ? "" : cid.split(";");

    plusart.gids = gid.split(";");
    plusart.useRandom = plusart.Depth < 2 && plusart.gids.length < 2 && plusart.cids.length == 0;
    plusart.gids.indexOf("me") > -1 && (plusart.gids[plusart.gids.indexOf("me")] = data.me.id);

    plusart.friction = parseFloat(params.friction || .9);
    plusart.gravity = parseFloat(params.gravity || .05);
    plusart.charge = parseFloat(params.charge || 10);
    plusart.theta = parseFloat(params.theta || .8);
    plusart.linkDistance = parseFloat(params.linkDistance || 1.2);
    plusart.linkStrength = parseFloat(params.linkStrength || 1.2);

    plusart.shownode = typeof params.shownode != "undefined" ? (params.shownode == '' ? true : params.shownode) : true;
    plusart.showedge = typeof params.showedge != "undefined" ? (params.showedge == '' ? true : params.showedge) : false;
    plusart.showdedge = typeof params.showdedge != "undefined" ? (params.showdedge == '' ? true : params.showdedge) : false;

    plusart.isInit = typeof params.reset != "undefined" ? false : plusart.isInit;
}

function onHash() {
    if (d3.event)
        d3.event.preventDefault();
    parseParams(document.location);

    function run(gids) {
        plusart.asyncForEach(gids, function(id) {
            getDataFromUserId(data, id, plusart.Count, plusart.Depth);
        });
    }

    if (plusart.isInit) {
        if (plusart.cids && plusart.cids.length) {
            plusart.asyncForEach(plusart.cids, function(id) {
                initCommunityMembers(data, id, function(item) {
                    run(item.nodeValue.members.map(function(d) { return d.id; }));
                })
            });
        }
        else
            run(plusart.gids);
    }
    else
    if (forceGraph)
        forceGraph.restart();
}

d3.select(window).on("hashchange", onHash);

window.data &&
    data.links.forEach(function(d) {
        d.sourceNode = data.nodes[d.source];
        d.targetNode = data.nodes[d.target];
    });

window.data = window.data || {
    hash : {},
    directHash: {},
    nodes : [],
    links : [],
    directLinks: {}
};

data.getIdByIndex = function(d) {
    return d ? (d.nodeValue.hasOwnProperty("actor") ? d.nodeValue.actor : d.nodeValue).id : null;
};

data.getSelected = function() {
    return data.selected;
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
var sizeNode = d3.scale.linear().range([0.1, 0.8]);

function callAlpha(d) {
    if (d) {
        var arr = alpha.domain().concat(
                [d.date]);
        var i = .5 / (arr.length || 1); //1;
        alpha.range(d3.range(.1, .5, i));
        alpha.domain(
            arr.sort(d3.ascending)
        );

        sizeNode.domain((sizeNode.domain().concat([d.r])).sort(d3.ascending));
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

plusart.calcCollisions = true;

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
        /*if (vis)
            vis.update();*/

        if (!plusart.calcCollisions)
            return;

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
        //vis.update();
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

    var hashCircleByColor = d3.map({});

    function byColor(a, b) {
        return d3.ascending(fill(1, a), fill(1, b))
    }

    function byOpacity(a, b) {
        return fill_opacity(1, a) - fill_opacity(1, b);
    }

    function makeCircle(color, stroke, radius, lw) {
        var tempCanvas = document.createElement('canvas')
            , ctx = tempCanvas.getContext('2d')
            ;

        tempCanvas.width = tempCanvas.height = radius * 2;

        ctx.beginPath();
        ctx.fillStyle = color;
        ctx.strokeStyle = stroke;
        ctx.lineWidth = lw;
        ctx.arc(radius, radius, radius, 0, PI_CIRCLE, true);
        color !== "none" && ctx.fill();
        stroke !== "none" && ctx.stroke();

        return tempCanvas;
    }


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
        typesEdge : {
            common : 0,
            direct : 1
        },
        makeEdge : function(context, styleEdge, typeEdge) {
            return function(d) {
                var s = d.source
                    , t = d.target
                    , sel = isChecked(t) ? t : s
                    , c = fill(1, sel)
                    , opacity = fill_opacity(1, sel)
                    ;
                context.strokeStyle = typeEdge ? "rgba(" + [155, 155, 155, opacity] + ")" : "rgba(" + [c.r, c.g, c.b, opacity] + ")";
                context.lineWidth = typeEdge ? /*d.size*/1 : 1;//linew(1, d.target);
                context.lineCap = "round";

                var xs = s.x,
                    ys = s.y,
                    xt = t.x,
                    yt = t.y;

                if (vis.checkVisible(s) || vis.checkVisible(t)) {
                    context.beginPath();
                    context[styleEdge](xs, ys, xt, yt);
                    context.stroke();
                }
            }
        },
        renderEdge : function(ctx) {
            if (plusart.showdedge || plusart.showedge) {
                var context = ctx;

                if (!context)
                    return;

                if (!vis.directMode && plusart.showdedge)
                    d3.values(data.directLinks).forEach(
                        this.makeEdge(context,
                            "solidLine",//"dottedLine",
                            this.typesEdge.direct));

                if (plusart.showedge)
                    forceGraph.links().forEach(
                        this.makeEdge(context,
                            "bizierLine",
                            this.typesEdge.common));
            }
        },
        renderNode : function(ctx) {
            if (typeof plusart.shownode != "undefined") {
                var context = ctx;

                if (!context)
                    return;

                var nodes = forceGraph.nodes()
                    , i = nodes.length
                    , d
                    , c
                    , img
                    , imgKey
                    , r
                    , r2
                    , ch
                    , sc
                    , tr
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

                        /*ch = isChecked(d);
                        c = fill(1, d);
                        sc = stroke(1, d);
                        r = (radius(1, d) + (!d.overed ? 0 : radius(1, d) * 0.2)) * 2;
                        r2 = r / 2;
                        tr = 256;

                        context.globalAlpha = 100 * fill_opacity(1, d);
                        imgKey = c.toString() + '_none_' + ch;
                        img = hashCircleByColor.get(imgKey);
                        if (!img) {
                            img = makeCircle(c, 'none', tr, 0);
                            hashCircleByColor.set(imgKey, img);
                        }
                        context.drawImage(img,  d.x - r2, d.y - r2, r, r);

                        context.globalAlpha = 100;
                        imgKey = 'none_' + sc.toString() + '_' + ch;
                        img = hashCircleByColor.get(imgKey);
                        if (!img) {
                            img = makeCircle('none', sc, tr, lineWidth(1, tr, ch));
                            hashCircleByColor.set(imgKey, img);
                        }
                        context.drawImage(img, d.x - r2, d.y - r2, r, r);

                        c = fill(0, d);
                        r = radius(0, d) + (!d.overed ? 0 : radius(0, d) * 0.2);
                        r2 = r / 2;

                        imgKey = c.toString() + '_none_' + ch;
                        img = hashCircleByColor.get(imgKey);
                        if (!img) {
                            img = makeCircle(c, 'none', tr, 0);
                            hashCircleByColor.set(imgKey, img);
                        }
                        context.drawImage(img, d.x - r2, d.y - r2, r, r);*/
                    }
                }
            }
        },
        update : function() {
            //vis.zoom();
            vis.valide = false;
        },
        render : function(ctx) {
            this.bufCanvas = this.bufCanvas || document.createElement('canvas');
            this.bufCtx = this.bufCtx || this.bufCanvas.getContext('2d');

            this.bufCanvas.width = w;
            this.bufCanvas.height = h;

            this.bufCtx.save();

            if (vis.event && !vis.dragOn) {
                if (vis.event.hasOwnProperty("translate"))
                    this.transform.translate = vis.event.translate.slice(0);
                if (vis.event.hasOwnProperty("scale"))
                    this.transform.scale = vis.event.scale;
                vis.event = undefined;
            }

            this.bufCtx.translate(this.transform.translate[0], this.transform.translate[1]);
            this.bufCtx.scale(this.transform.scale, this.transform.scale);

            this.renderEdge(this.bufCtx);
            this.renderNode(this.bufCtx);

            this.bufCtx.restore();

            return this.bufCanvas;
        },
        zoom : function() {
            if (this.canvas) {
                this.canvas.save();
                this.canvas.clearRect(0, 0, w, h);

                this.canvas.drawImage(this.render(), 0, 0, w, h);

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
        runpanel = d3.select("#runpanel"),
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
                data.selected = d;
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
        var bc = isChecked(d) ? colors(d.type) : (data.selected ? d3.rgb("#666") : colors(d.type));
        return i ? bc : colors(d.type).darker().darker();
    }

    function fill_opacity(i, d) {
        return i ? (isChecked(d) || (d.type != 1 && plusart.gids.indexOf(d.nodeValue.id) > -1) ? .8 : alpha(d.date)) : 1;
    }

    function isChecked(d) {
        return d.clicked
                || d === data.selected
                || (
                d.type != 1
                        && data.selected
                        && (
                            d.nodeValue.hasOwnProperty("actor")
                                ? d.nodeValue.actor
                                : d.nodeValue
                        ).id === data.getIdByIndex(data.selected)
                );
    }

    function linew(i, d) {
        return lineWidth(i, radiuses(d.r), isChecked(d));
    }

    function lineWidth(i, r, ch) {
        return i ? r * (ch ? 0.06 : 0.02) : 0;
    }

    function stroke(i, d) {
        return !isChecked(d) ? "#666" : colors(d.type).darker().darker();
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
        plusart.isInit = true;

        onHash();
    }

    firstRequest();
    run_renderTimer();
    run_calcTimer();
}

function closeInterval(timer) {
    if (timer == "dgraphTimer"){
        /*remakeSim();
        window[timer] = undefined;*/
        run_dgraphTimer();
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
    (function loop(){
        if (renderTimer)
            requestAnimationFrame(loop);
        if (!vis.valide) {
            vis.valide = true;
            vis.zoom();
            vis.update();
        }
    })();
}

function run_calcTimer() {
    closeInterval("calcTimer");
    autostop = calcTimer = true;
    forceGraph.start();
}

function toDirectGraph() {

    if (!data.directMode) {
        (function(ids){
            forceGraph.nodes().forEach( function(d) {
                d.visible = ids.indexOf(d) > -1;
            });
        })(d3.values(data.directHash).map(function(d) {
            d.node.br = d.node.r;
            d.node.blinkDegree = d.node.linkDegree;
            d.node.r = sizeNode(d.r);
            d.node.linkDegree = d.linkDegree;
            return d.node;
        }));
        forceGraph.links(d3.values(data.directLinks).map(function(k) { return {source : k.source.node, target : k.target.node}; }));
        data.directMode = vis.directMode = true;
    }
    else {
        data.directMode = vis.directMode = false;
        forceGraph.links(data.links);
        (function(ids){
            forceGraph.nodes().forEach(function(d) {
                d.visible = true;
            });
        })(d3.values(data.directHash).map(function(d) {
            d.node.r = d.node.br;
            d.node.linkDegree = d.node.blinkDegree;
            return d.node;
        }));
    }
    if (calcTimer)
        forceGraph.start();
    else
        forceGraph.restart();
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
            d3.select("#runpanel").style("display", "block");
            d3.selectAll("#lpbtn, #tpbtn").on("click", function(item) {
                item = d3.select(this.parentNode);
                if (item.classed("open"))
                    item.classed("open", false);
                else
                    item.classed("open", true);
            });
            d3.select("#runBtn").on('click', function() {
                var gids = d3.select("#gids").property("value").split(';');

                plusart.gids.forEach(function(d) {
                    if (gids.indexOf(d) < 0)
                        gids.push(d);
                });

                location.hash = "#" + [
                    "gids=" + gids.join(';')
                ].join("&");
            });
            startFlow();
        });
    });
}


