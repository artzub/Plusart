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
                    maxReshare : options.maxReshare || 20
                }
            else
                options = {
                    pids : "me",
                    maxResult : 20,
                    maxComments : 20,
                    maxPlusone : 20,
                    maxReshare : 20
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
            var pids = options.pids.split(';');
            var lastPid = 0;
            var countCompleteStep = 0;
            var posts = null;
            var postId = null;
            var index = 0;
            var curStep = 0;

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

                gapi.client.plus.comments.list({
                    "maxResults" : options.maxComments,
                    "fields":"items/actor",
                    "activityId":postId
                }).execute(function(resp) {
                    dataIndexes[postId].comments = resp.items;
                    stillWorking.sub = false;
                });
                operation = TypeActions.plusone;
            }

            var parsePlusoneReshare = function() {
                if (!continueWork())
                    return;

                gapi.client.plus.people.listByActivity({
                    "maxResults" : operation == TypeActions.plusone ? options.maxPlusone : options.maxReshare,
                    "fields":"items(displayName,id,image,url)",
                    "activityId":postId,
                    "collection": operation == TypeActions.plusone ? "plusoners" : "resharers"
                }).execute(function(resp) {
                    var ext = operation == TypeActions.reshare ? "plusoners" : "sharers";
                    dataIndexes[postId][ext] = resp.items;
                    if(ext == "sharers")
                        index++;
                    stillWorking.sub = false;
                });
                operation = operation == TypeActions.plusone ? TypeActions.reshare : TypeActions.post;
            }

            var switcher = function() {

                if (!continueWork() || posts.length < 1) {
                    countCompleteStep++;
                    posts = null;
                    index = 0;

                    if(isExists(obj.onStep))
                        obj.onStep(++curStep, options.maxResult);

                    if(isExists(obj.onGenerate)) {
                        var dataResult = dataIndexes;
                        if (isExists(obj.DataBuilder)) {
                            obj.DataBuilder.dataGenerator(dataResult);
                            dataResult = obj.DataBuilder.dataResult;
                        }
                        obj.onGenerate(dataResult);
                    }

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
                            obj.onStep(curStep++, options.maxResult);
                        parsePost();
                        break;
                    case TypeActions.comment:
                        if(stillWorking.sub = posts[index].object.replies.totalItems > 0)
                            parseComment();
                        else
                            operation = TypeActions.plusone;
                        break;
                    case TypeActions.plusone:
                        if(stillWorking.sub = posts[index].object.plusoners.totalItems > 0)
                            parsePlusoneReshare();
                        else
                            operation = TypeActions.reshare;
                        break;
                    case TypeActions.reshare:
                        if(stillWorking.sub = posts[index].object.resharers.totalItems > 0)
                            parsePlusoneReshare();
                        else {
                            operation = TypeActions.post;
                            index++;
                        }
                        break;
                }
                switcher();
            }

            function doGenerate(resp){
                posts = null;
                nextPage = resp.nextPageToken;
                if (!nextPage) {
                    step = 0;
                }

                if (!resp.items) {
                    step = 0;
                    stillWorking.main = false;
                    return;
                }
                posts = resp.items;

                switcher();
            }

            function run(pid) {

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
                    'userId' : pid,
                    'collection' : 'public',
                    'maxResults' : nextCount,
                    'pageToken' : nextPage
                }).execute(doGenerate);

                stillWorking.main = true;
                run(pid);
            }

            var loopPids = function() {
                curStep = 0;
                if(isExists(obj.onStep))
                    obj.onStep(curStep, options.maxResult);

                if (lastPid > pids.length - 1) {
                    if(isExists(obj.onComplete))
                        obj.onComplete();
                    return false;
                }
                var pid = pids[lastPid++];

                if (typeof(pid) == "undefined" || pid == null || pid.length < 1){
                    loopPids();
                    return false;
                }

                step = options.maxResult / 100;
                nextPage = null;
                run(pid.replace(/\s/g, ""));
            }

            if(isExists(obj.onBeforeGenerate))
                obj.onBeforeGenerate();

            if (options.maxResult < 0)
                options.maxResult *= -1;

            loopPids();
        }
    }
})();