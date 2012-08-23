function urlListActivities(id) {
    return conf.BASE_REQUEST_URI + 'people/' + (id || 'me') + '/activities/public?maxResults=10'
}

function incSize(item) {
    item.linkDegree++;
    item.r++;
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
            index: i
        });
        idUser = i;
        //type != 1 && (data.hash[id] = i);
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
    depth = depth || 0;
    return function(pluses) {
        if (pluses.hasOwnProperty("error")) {
            console.log(pluses);
            return;
        }
        plusar.asyncForEach(pluses.items, function(item) {
            var id = (item.hasOwnProperty("actor") ? item.actor : item).id;
            addChildNode(data, parent, type, item);
            if (depth > 0 && !data.hash.hasOwnProperty(id)) {
                data.hash[id] = -1;
                sendRequest(accessToken().access_token,
                    urlListActivities(id),
                    parseUserActivity(data, plusar.Count, depth - 1)
                );
            }
        });
    }
}

function parseUserActivity(data, count, depth) {
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
                    index : i
                });
                idUser = i;
                data.hash[item.actor.id] = i;
                sim.particle(data.nodes[i]);
            }
            var parent = data.nodes[idUser];

            i = addChildNode(data, parent, 1, item, false);

            if (item.object) {
                ["replies", "plusoners", "resharers"].forEach(function(l, j) {
                    if (item.object.hasOwnProperty(l)
                    &&  item.object[l].totalItems) {
                        sendRequest(accessToken().access_token,
                            item.object[l].selfLink,
                            parsePostActivity(data,
                                data.nodes[i],
                                depth - 1,
                                j + 2
                            )
                        )
                    }
                })
            }
        });
        if (activities.nextPageToken && count - activities.items.length > 0)
            sendRequest(accessToken().access_token,
                activities.nextLink,
                parseUserActivity(data, count - activities.items.length,
                    depth)
            );
    }
}