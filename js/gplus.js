function initEmptyUser() {
    return {};
}

function addDirectNodeData(data, id, node) {
    return (data.directHash = data.directHash || {})
        && (data.directHash[id]
            || (data.directHash[id] = {
                id : id,
                out : 0,
                in : 0,
                r : MIN_SIZE_NODE + 3,
                linkDegree : MIN_LD_NODE,
                node : node
            }))
        ;
}

function addDirectLink(data, parent, child) {
    data.directLinks = data.directLinks || {};
    var item = parent.id + "_" + child.id;
    item = data.directLinks[item] || (data.directLinks[item] = {
        source: child,
        target: parent,
        size : 0
    });
    if (item.size++ === 0) {
        child.out++;
        parent.in++;
    }
    return item;
}

function addChildNode(data, parent, type, value, random) {
    var dp = type == 1 ? new Date(value.published).getTime() : parent.date,
        du = type == 1 ? new Date(value.updated).getTime() : parent.date;

    var id = (value.hasOwnProperty("actor") ? value.actor : value).id;

    var child = {
        x: random ? w/2 * Math.random() * (Math.round((Math.random() * 2) % 2) ? -1 : 1) : parent.x + (parent.r * 2) * Math.cos(2 * Math.PI * Math.random()),
        y: random ? h/2 * Math.random() * (Math.round((Math.random() * 2) % 2) ? -1 : 1) : parent.y + (parent.r * 2) * Math.sin(2 * Math.PI * Math.random()),
        r: MIN_SIZE_NODE + 3,
        linkDegree: MIN_LD_NODE,
        type: type,
        nodeValue: value,
        date : d3.max([dp, du])
    };
    data.nodes.push(child);

    if (plusart.redraw)
        plusart.redraw(child);

    if (type != 1) {
        var dnc = addDirectNodeData(data, id, child),
            idp = parent.nodeValue.actor.id,
            inid = data.hash.hasOwnProperty(id) ? data.hash[id] : -1,
            inidp = data.hash.hasOwnProperty(idp) ? data.hash[idp] : -1,
            dnp, chc, chp, dl;

        if (inid !== -1) {
            if (chc = (dnc !== inid && (!dnc.id || inid.type < dnc.type)))
                dnc = inid;
            incSize(dnc);
        }

        dnp = addDirectNodeData(data, idp, inidp);
        if (inidp !== -1
            && (chp = (inidp !== dnp && (!dnp.id || inidp.type < dnp.type))))
            dnp = inidp;

        incSize(dnp);
        incSize(dnc);

        dl = addDirectLink(data, dnp, dnc);

        if (chc)
            dl.source = dnc;

        if (chp)
            dl.target = dnp;
    }

    incSize(parent);
    incSize(child);

    data.links.push({
        source: child,
        target: parent,
        size : 1
    });
    if (plusart.redraw)
        plusart.redraw();

    return child;
}

function getDataFromUserId(data, id, count, depth) {
    if (!data.hash.hasOwnProperty(id)) {
        data.hash[id] = initEmptyUser();
        parseUserActivity(data, id, count, depth);
    }
}
function parsePostActivity(data, parent, depth, type) {
    function run(data, parent, depth, type) {
        depth = depth || 0;
        return function(pluses) {
            if (pluses.hasOwnProperty("error")) {
                console.log(pluses);
                return;
            }

            plusart.asyncForEach(pluses.items, function(item) {
                var id = (item.hasOwnProperty("actor") ? item.actor : item).id;
                addChildNode(data, parent,
                    type == "replies"
                          ? 2 : type == "plusoners"
                                      ? 3 : type == "resharers" ? 4 : 5,
                    item);
                if (depth > 0)
                    getDataFromUserId(data, id, plusart.Count, depth);
            });
        }
    }

    if (parent.nodeValue.id && plusart.maxResults[type]) {
        var request;
        if (type == "replies") {
            request = gapi.client.plus.comments.list({
                maxResults : plusart.maxResults[type],
                //"fields":"items(actor(displayName,id),id,inReplyTo/id,published,updated)",
                activityId : parent.nodeValue.id
            });
        }
        else {
            request = gapi.client.plus.people.listByActivity({
                maxResults : plusart.maxResults[type],
                //"fields":"items(displayName,id),selfLink",
                activityId : parent.nodeValue.id,
                collection : type
            });
        }
        if (request)
            request.execute(run(data, parent, depth, type));
    }
}

function parseUserActivity(data, id, count, depth, nextPage) {
    function run(data, id, count, depth) {
        depth = depth || 0;
        return function(activities) {
            if (!activities || activities.hasOwnProperty("error")) {
                console.log(activities || { error: "no object"});
                return;
            }

            count = count > 0 ? activities.items.length : count;
            plusart.asyncForEach(activities.items, function(item) {
                var dp = new Date(item.published).getTime(),
                    du = new Date(item.updated).getTime(),
                    i,
                    parent = data.hash[item.actor.id];
                if (typeof parent == "undefined" || !parent.nodeValue) {
                    parent = {
                        x : w/2 * Math.random() * (Math.round((Math.random() * 2) % 2) ? -1 : 1),
                        y : h/2 * Math.random() * (Math.round((Math.random() * 2) % 2) ? -1 : 1),
                        r : 7,
                        linkDegree : 0,
                        type : 0,
                        nodeValue : item.actor,
                        date : d3.max([dp, du])
                    };
                    data.hash[item.actor.id] = parent;
                    data.nodes.push(parent);
                    addDirectNodeData(data, item.actor.id, parent);

                    if (plusart.redraw)
                        plusart.redraw(parent);
                }

                i = addChildNode(data, parent, 1, item, plusart.useRandom);

                if (item.object) {
                    ["replies", "plusoners", "resharers"].forEach(function(l) {
                        if (item.object.hasOwnProperty(l)
                        &&  item.object[l].totalItems) {
                            parsePostActivity(
                                data,
                                i,
                                depth - 1,
                                l
                            );
                        }
                    })
                }
            });
            if (activities.items)
                if (activities.nextPageToken && count - activities.items.length > 0)
                    parseUserActivity(data, id, count - activities.items.length, depth, activities.nextPageToken)
        }
    }

    gapi.client.plus.activities.list({
        //'fields' : 'nextPageToken,items(actor(displayName,id),id,object(actor(displayName,id),plusoners,replies,resharers),published,updated,verb)',
        userId : id,
        collection : 'public',
        maxResults : count - 100 >= 0 ? 100 : count,
        pageToken : nextPage
    }).execute(run(data, id, count, depth));
}

/**
 * Communities
 */

function parseUser(ud) {
    if (!ud)
        return null;

    return {
        id: ud[0],
        displayName: ud[2],
        url: "https://plus.google.com/" + ud[0],
        image: {
            url: "https:" + ud[1] + "?sz=50"
        }
    }
}

function initCommunityMembers(data, id, callback) {
    if (!data.hasOwnProperty('chash'))
        data.chash = {};

    if (!data.hasOwnProperty('comNodes'))
        data.comNodes = [];

    if (data.chash[id] && data.chash[id] >= 0)
        return;

    data.chash[id] = -1;

    JSONP('http://plusart.artzub.com/gpluscm/?d=' + encodeURIComponent('["' + id + '", null]'),
        parseCommunity(data, id, callback)
    )
}

function parseCommunity(data, id, callback){
    return function(req) {
        if (!req || req.hasOwnProperty('error') || !(req instanceof Array)) {
            console.log(req || { error: "no object"});
            return;
        }

        var rm = req[0][0] == "sq.rsmr",
            com = {nodeValue : {}},
            gids = rm ? req[0][1][0] : req[0][2][1][1],
            coms = rm ? req[0][2][0] : req[0][1][0],
            page = gids[2];

        if (!data.chash.hasOwnProperty(id) || data.chash[id] < 0) {
            com.nodeValue.id = coms[0];
            com.nodeValue.name = coms[1][0];
            com.nodeValue.tags = coms[1][1];
            com.nodeValue.image = {url : coms[1][3]};
            com.nodeValue.decs = coms[1][5];
            com.nodeValue.membersCount = req[0][1][3][0];
            com.nodeValue.mhash = {};
            com.nodeValue.members = [];
            com.nodeValue.curPos = 0;

            data.chash[id] = com.index = data.comNodes.push(com) - 1;
        }
        else {
            com = data.comNodes[data.chash[id]];
        }

        var i = gids[3].length;
        com.nodeValue.curPos += i - 1;
        i = plusart.cmBeginPos <= com.nodeValue.curPos
            ? (!com.nodeValue.members.length
                ? plusart.cmBeginPos - (com.nodeValue.curPos - i)
                : i)
            : 0;

        while(i-- && plusart.membersCount > com.nodeValue.members.length){
            var user = parseUser(gids[3][i]);

            if (user && !com.nodeValue.mhash.hasOwnProperty(user.id))
                com.nodeValue.mhash[user.id] = com.nodeValue.members.push(user) - 1;
        }

        callback &&
            callback(com);

        if (com.nodeValue.membersCount
            && plusart.membersCount > com.nodeValue.members.length
            && page) {
            page = gids.slice(0, 3);
            var c = plusart.membersCount - com.nodeValue.members.length;
            page[1] = page[1] ? (plusart.cmBeginPos ? plusart.cmBeginPos : (c - 100 >= 0 ? 100 : c)) : page[1];
            readCommunityMembers(data, id, page, callback);
        }
    }
}

function readCommunityMembers(data, id, page, callback) {
    JSONP('http://plusart.artzub.com/gpluscm/?r=1&d=' + encodeURIComponent('["' + id + '", ' + JSON.stringify([page]) + ']'),
        parseCommunity(data, id, callback)
    );
}
