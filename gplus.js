function urlListActivities(id) {
    return conf.BASE_REQUEST_URI + 'people/' + (id || 'me') + '/activities/public?maxResults=10'
}

function incSize(item) {
    item.linkDegree++;
    item.r++;
}

function callAlpha(data) {
    limits = data.nodes.reduce(function(p, d) {
        return {
            min : pv.min([p.min, d.date]),
            max : pv.max([p.max, d.date])
        }
    }, {min : Infinity, max : -Infinity});
    alpha.domain(limits.min, limits.max);
}

function addChildNode(data, parent, type, value, random) {
    var i = data.nodes.length;

    var id = (value.hasOwnProperty("actor") ? value.actor : value).id;
    var idUser = 0;

    //if (typeof idUser == "undefined" || type == 1) {
        data.nodes.push({
            x: random ? w * Math.random() : parent.x + (parent.r * 2) * Math.cos(2 * Math.PI * Math.random()),
            y: random ? h * Math.random() : parent.y + (parent.r * 2) * Math.sin(2 * Math.PI * Math.random()),
            r: 4,
            linkDegree: 0,
            type: type,
            nodeValue: value,
            date : type == 1 ? pv.max([new Date(value.published).getTime(), new Date(value.updated).getTime()]) : parent.date,
            index: i
        });
        idUser = i;
        //type != 1 && (data.hash[id] = i);
        callAlpha(data);
        sim.particle(data.nodes[idUser]);
    //}

    if (type != 1 && typeof data.hash[id] != "undefined" && data.hash[id] > 0)
        incSize(data.nodes[data.hash[id]]);

    incSize(parent);
    incSize(data.nodes[idUser]);

    //if (!data.hash.hasOwnProperty(idUser + "_" + parent.index)) {
        data.links.push({
            source: idUser,
            sourceNode: data.nodes[idUser],
            target: parent.index,
            targetNode: parent
        });
        force.links(data.links);
    //}
    return idUser;
}

function parsePostActivity(data, parent, depth, type) {
    function run(data, parent, depth, type) {
        depth = depth || 0;
        return function(pluses) {
            if (pluses.hasOwnProperty("error")) {
                console.log(pluses);
                return;
            }

            plusar.asyncForEach(pluses.items, function(item) {
                var id = (item.hasOwnProperty("actor") ? item.actor : item).id;
                addChildNode(data, parent,
                    type == "replies"
                          ? 2 : type == "plusoners"
                                      ? 3 : type == "resharers" ? 4 : 5,
                    item);
                if (depth > 0 && !data.hash.hasOwnProperty(id)) {
                    data.hash[id] = -1;
                    parseUserActivity(data, id, plusar.Count, depth);
                }
            });
        }
    }

    if (parent.nodeValue.id && plusar.maxResults[type]) {
        var request;
        if (type == "replies") {
            request = gapi.client.plus.comments.list({
                maxResults : plusar.maxResults[type],
                //"fields":"items(actor(displayName,id),id,inReplyTo/id,published,updated)",
                activityId : parent.nodeValue.id
            });
        }
        else {
            request = gapi.client.plus.people.listByActivity({
                maxResults : plusar.maxResults[type],
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
            if (activities.hasOwnProperty("error")) {
                console.log(activities);
                return;
            }

            count = typeof count === "undefined" ? activities.items.length : count;
            plusar.asyncForEach(activities.items, function(item) {
                var i = data.nodes.length;
                var idUser = data.hash[item.actor.id];
                if (typeof idUser == "undefined" || idUser == -1) {
                    data.nodes.push({
                        x : w * Math.random(),
                        y : h * Math.random(),
                        r : 7,
                        linkDegree : 0,
                        type : 0,
                        nodeValue : item.actor,
                        date : pv.max([new Date(item.published).getTime(), new Date(item.updated).getTime()]),
                        index : i
                    });
                    idUser = i;
                    data.hash[item.actor.id] = i;
                    callAlpha(data);
                    sim.particle(data.nodes[i]);
                }
                var parent = data.nodes[idUser];
                parent.date = pv.max([parent.date, new Date(item.published).getTime(), new Date(item.updated).getTime()]);

                i = addChildNode(data, parent, 1, item, plusar.useRandom);

                if (item.object) {
                    ["replies", "plusoners", "resharers"].forEach(function(l, j) {
                        if (item.object.hasOwnProperty(l)
                        &&  item.object[l].totalItems) {
                            parsePostActivity(
                                data,
                                data.nodes[i],
                                depth - 1,
                                l
                            );
                        }
                    })
                }
            });
            if (activities.nextPageToken && count - activities.items.length > 0)
                parseUserActivity(data, id, count - activities.items.length, depth, activities.nextPageToken)
        }
    }

    gapi.client.plus.activities.list({
        //'fields' : 'nextPageToken,items(actor(displayName,id),id,object(actor(displayName,id),plusoners,replies,resharers),published,updated,verb)',
        userId : id,
        collection : 'public',
        maxResults : 10,
        pageToken : nextPage
    }).execute(run(data, id, count, depth));
}