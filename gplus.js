function urlListActivities(id) {
    return conf.BASE_REQUEST_URI + 'people/' + (id || 'me') + '/activities/public?maxResults=10'
}

function incSize(item) {
    item.linkDegree++;
    item.r++;
}

function decSize(item) {
    item.linkDegree--;
    item.linkDegree = item.linkDegree < 0 ? 0 : item.linkDegree;
    item.r--;
    item.r = item.r < 0 ? 0 : item.r;
}


function addChildNode(data, parent, type, value, random) {
    var i = data.nodes.length;
    var dp = type == 1 ? new Date(value.published).getTime() : parent.date,
        du = type == 1 ? new Date(value.updated).getTime() : parent.date;

    var id = (value.hasOwnProperty("actor") ? value.actor : value).id;
    var idUser;

    //if (typeof idUser == "undefined" || type == 1) {
        data.nodes.push({
            x: random ? w/2 * Math.random() * (Math.round((Math.random() * 2) % 2) ? -1 : 1) : parent.x + (parent.r * 2) * Math.cos(2 * Math.PI * Math.random()),
            y: random ? h/2 * Math.random() * (Math.round((Math.random() * 2) % 2) ? -1 : 1) : parent.y + (parent.r * 2) * Math.sin(2 * Math.PI * Math.random()),
            r: 4,
            linkDegree: 0,
            type: type,
            nodeValue: value,
            date : d3.max([dp, du]),
            index: i
        });
        idUser = i;
        //type != 1 && (data.hash[id] = i);
        if (plusart.redraw)
            plusart.redraw(data.nodes[idUser]);
    //}

    if (type != 1 && typeof data.hash[id] != "undefined" && data.hash[id] > 0)
        incSize(data.nodes[data.hash[id]]);

    incSize(parent);
    incSize(data.nodes[idUser]);

    //if (!data.hash.hasOwnProperty(idUser + "_" + parent.index)) {
        data.links.push({
            source: data.nodes[idUser],
            sourceIndex : idUser,
            sourceNode: data.nodes[idUser],
            target: parent,
            targetIndex : parent.index,
            targetNode: parent
        });
        if (plusart.redraw)
            plusart.redraw();
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

            plusart.asyncForEach(pluses.items, function(item) {
                var id = (item.hasOwnProperty("actor") ? item.actor : item).id;
                addChildNode(data, parent,
                    type == "replies"
                          ? 2 : type == "plusoners"
                                      ? 3 : type == "resharers" ? 4 : 5,
                    item);
                if (depth > 0 && !data.hash.hasOwnProperty(id)) {
                    data.hash[id] = -1;
                    parseUserActivity(data, id, plusart.Count, depth);
                }
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
    window.ttt = window.ttt || {};
    function run(data, id, count, depth) {
        depth = depth || 0;
        return function(activities) {
            if (!activities || activities.hasOwnProperty("error")) {
                console.log(activities || { error: "no object"});
                return;
            }

            count = typeof count === "undefined" ? activities.items.length : count;
            plusart.asyncForEach(activities.items, function(item) {
                var dp = new Date(item.published).getTime(),
                    du = new Date(item.updated).getTime(),
                    parent,
                    i = data.hash[item.actor.id];
                if (typeof i == "undefined" || i == -1) {
                    parent = {
                        x : w/2 * Math.random() * (Math.round((Math.random() * 2) % 2) ? -1 : 1),
                        y : h/2 * Math.random() * (Math.round((Math.random() * 2) % 2) ? -1 : 1),
                        r : 7,
                        linkDegree : 0,
                        type : 0,
                        nodeValue : item.actor,
                        date : d3.max([dp, du]),
                        dates : [],
                        index : 0
                    };
                    parent.index = data.hash[item.actor.id] = data.nodes.push(parent) - 1;
                    if (plusart.redraw)
                        plusart.redraw(data.nodes[parent.index]);
                }
                else {
                    parent = data.nodes[i];
                }
                parent.dates.push(d3.max([dp, du]));

                i = addChildNode(data, parent, 1, item, plusart.useRandom);

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
            if (activities.items)
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