(function(){
    window.GraphGPlus = {
        init_gapis : function(callback){
            this.initcallback = callback;
            this.inited_gapis = typeof(gapi.client.plus) != 'undefined' && gapi.client.plus != null;
            if(!this.inited_gapis)
                gapi.client.load('plus', 'v1', this.initcallback);
            else {
                if (typeof(this.initcallback) != 'undefined' && this.initcallback != null)
                    this.initcallback();
            }
        },

        DataBuilder : null,

        onGenerate : function(data) {
        },
        onComplete : function() {
        },
        onStep : function(pos, max) {
        },
        onBeforGenerate : function() {
        },

        generate : function(options) {
            var obj = this;
            var isExists = function (item) {
                return typeof(item) != 'undefined' && item != null
            }

            if (isExists(options))
                options = {
                    pids : options.pids || "me",
                    maxResult : options.maxResult || 20,
                    maxComments : options.maxComments || 20,
                    maxPlusone : options.maxPlusone || 20,
                    maxReshare : options.maxReshare || 20,
                    depth : options.depth || 0
                }
            else
                options = {
                    pids : "me",
                    maxResult : 20,
                    maxComments : 20,
                    maxPlusone : 20,
                    maxReshare : 20,
                    depth : 0
                }

            var TypeActions = {
                post : 0,
                repost : 1,
                comment : 2,
                plusone : 3,
                reshare : 4
            };
            var operation = TypeActions.post;

            var dataIndexes = {};
            var usersSkip = {};

            var stillWorking = {
                main : false,
                sub  : false
            };

            var step = 0;
            var nextPage = null;

            var addPid = function(pid, depth) {
                return {pid : pid, depth : depth || 0};
            }

            var pids = [];
            var pidst = options.pids.split(';');
            for(var pidin in pidst){
                pidin = pidst[pidin].replace(/\s/g, "");
                if (pidin.length > 0)
                    pids.push(addPid(pidin, options.depth));
            }
            var curPid = addPid("me");
            var completePids = {};
            var addedPids = {};

            var lastPid = 0;
            var countCompleteStep = 0;
            var posts = null;
            var postId = null;
            var index = 0;
            var curStep = 0;

            var getState = function() {
                return "Generation (" + lastPid + " of " + pids.length + ") ...";
            }

            var continueWork = function() {
                if (result = (!posts || index >= posts.length)) {
                    stillWorking.sub = false;
                }
                return !result;
            };

            var parsePost = function(){
                if (!continueWork())
                    return;

                var post = posts[index];
                postId = post.id;

                var notObject = !post.object;

                var share = null;
                if (post.verb == 'share' && !notObject){
                    share = {
                        actor : post.object.actor
                    };
                    if (curPid.depth > 0
                        &&  isExists(share.actor)
                        &&  !isExists(addedPids[share.actor.id])
                        &&  !isExists(completePids[share.actor.id])) {
                        pids.push(addPid(share.actor.id, curPid.depth - 1));
                        addedPids[share.actor.id] = true;
                    }
                }

                dataIndexes[postId] = {
                    post : {
                        actor : post.actor
                    },
                    share : share
                }

                operation = TypeActions.comment;
                if (notObject) {
                    index++;
                    operation = TypeActions.post;
                }
                stillWorking.sub = false;
            };

            var parseComment = function() {
                if (!continueWork())
                    return;

                if (options.maxComments > 0) {
                    gapi.client.plus.comments.list({
                        "maxResults" : options.maxComments,
                        "fields":"items/actor",
                        "activityId":postId
                    }).execute(function(resp) {
                        stillWorking.sub = isExists(resp.items);
                        if (!stillWorking.sub) return;

                        dataIndexes[postId].comments = resp.items;
                        if (curPid.depth > 0) {
                            for(var item in resp.items) {
                                item = resp.items[item];
                                if (isExists(item.actor)
                                    && !isExists(addedPids[item.actor.id])
                                    && !isExists(completePids[item.actor.id])) {
                                    pids.push(addPid(item.actor.id, curPid.depth - 1));
                                    addedPids[item.actor.id] = true;
                                }
                            }
                        }
                        stillWorking.sub = false;
                    });
                }
                operation = TypeActions.plusone;
            }

            var parsePlusoneReshare = function() {
                if (!continueWork())
                    return;

                var maxres = operation == TypeActions.plusone ? options.maxPlusone : options.maxReshare;

                if (maxres > 0) {
                    gapi.client.plus.people.listByActivity({
                        "maxResults" : maxres,
                        "fields":"items(displayName,id,image,url)",
                        "activityId":postId,
                        "collection": operation == TypeActions.plusone ? "plusoners" : "resharers"
                    }).execute(function(resp) {
                        stillWorking.sub = isExists(resp.items);
                        if (!stillWorking.sub) return;

                        var ext = operation == TypeActions.reshare ? "plusoners" : "sharers";

                        dataIndexes[postId][ext] = resp.items;
                        if (curPid.depth > 0) {
                            for(var item in resp.items) {
                                item = resp.items[item];
                                if (isExists(item)
                                    && !isExists(addedPids[item.id])
                                    && !isExists(completePids[item.id])) {
                                    pids.push(addPid(item.id, curPid.depth - 1));
                                    addedPids[item.id] = true;
                                }
                            }
                        }
                        stillWorking.sub = false;
                    });
                }
                operation = operation == TypeActions.plusone ? TypeActions.reshare : TypeActions.post;
            }

            var switcher = function() {

                if (!continueWork() || posts.length < 1) {
                    countCompleteStep++;
                    posts = null;
                    index = -1;

                    if(isExists(obj.onStep))
                        obj.onStep(++curStep, options.maxResult, getState());

                    var dataResult = dataIndexes;
                    if (isExists(obj.DataBuilder)) {
                        obj.DataBuilder.dataGenerator(dataResult);
                        dataResult = obj.DataBuilder.dataResult;
                    }
                    if(false && isExists(obj.onGenerate))
                        obj.onGenerate(dataResult);

                    stillWorking.main = false;
                    return;
                }

                if(stillWorking.sub) {
                    setTimeout(switcher, 300);
                    return;
                }

                stillWorking.sub = true;

                switch(operation){
                    case TypeActions.post:
                        if(isExists(obj.onStep))
                            obj.onStep(curStep++, options.maxResult, getState());
                        index++;
                        parsePost();
                        break;
                    case TypeActions.comment:
                        if(stillWorking.sub = posts[index].object.replies.totalItems > 0
                          && options.maxComments > 0)
                            parseComment();
                        else
                            operation = TypeActions.plusone;
                        break;
                    case TypeActions.plusone:
                        if(stillWorking.sub = posts[index].object.plusoners.totalItems > 0
                          && options.maxPlusone > 0 )
                            parsePlusoneReshare();
                        else
                            operation = TypeActions.reshare;
                        break;
                    case TypeActions.reshare:
                        if(stillWorking.sub = posts[index].object.resharers.totalItems > 0
                          && options.maxReshare > 0)
                            parsePlusoneReshare();
                        else
                            operation = TypeActions.post;
                        break;
                }
                switcher();
            }

            function doGenerate(resp){
                posts = null;
                index = -1;
                nextPage = resp.nextPageToken;
                if (!isExists(nextPage)) {
                    step = 0;
                }

                if (!isExists(resp.items)) {
                    step = 0;
                    stillWorking.main = false;
                    return;
                }
                posts = resp.items;

                switcher();
            }

            function run() {

                if (stillWorking.main) {
                    setTimeout(run, 500);
                    return;
                }

                if(!step || step < 0) {
                    loopPids();
                    return;
                }

                var nextCount = 100;
                if (step-- < 1) {
                    nextCount = parseInt((step + 1) * 100);
                    step = 0;
                }

                if(!countCompleteStep) {
                }

                dataIndexes = {};

                var request = gapi.client.plus.activities.list({
                    'fields' : 'nextPageToken,items(actor(displayName,id,image,url),id,object(actor,id,plusoners,replies,resharers),verb)',
                    'userId' : curPid.pid,
                    'collection' : 'public',
                    'maxResults' : nextCount,
                    'pageToken' : nextPage
                }).execute(doGenerate);

                stillWorking.main = true;
                run();
            }

            var loopPids = function() {
                curStep = 0;
                if(isExists(obj.onStep))
                    obj.onStep(curStep, options.maxResult, getState());

                if (lastPid > pids.length - 1) {
                    if(isExists(obj.onComplete))
                        obj.onComplete();
                    var dataResult = dataIndexes;
                    if (isExists(obj.DataBuilder)) {
                        dataResult = obj.DataBuilder.dataResult;
                    }
                    if(isExists(obj.onGenerate))
                        obj.onGenerate(dataResult);
                    return false;
                }
                curPid = pids[lastPid++];


                if(isExists(obj.onStep))
                    obj.onStep(curStep, options.maxResult, getState());

                if (!isExists(curPid) || !isExists(curPid.pid) ||
                    curPid.pid.length < 1 || isExists(completePids[curPid.pid])){
                    loopPids();
                    return false;
                }

                step = options.maxResult / 100;
                nextPage = null;
                completePids[curPid.pid] = true;
                run();
            }

            if(isExists(obj.onBeforeGenerate))
                obj.onBeforeGenerate();

            if (options.maxResult < 0)
                options.maxResult *= -1;

            loopPids();
        }
    }
})();